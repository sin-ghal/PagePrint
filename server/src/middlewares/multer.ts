import multer from "multer"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import { v2 as cloudinary } from "cloudinary"
import { fromBuffer } from "file-type"
import { Request } from "express"

// Allowed MIME types mapped to their expected magic-byte signatures
const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  "application/pdf":                                                          ["pdf"],
  "application/msword":                                                       ["doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":  ["docx"],
  "application/vnd.ms-excel":                                                 ["xls"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":        ["xlsx"],
  "application/vnd.ms-powerpoint":                                            ["ppt"],
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":["pptx"],
  "image/png":                                                                ["png"],
  "image/jpeg":                                                               ["jpg", "jpeg"],
  "text/plain":                                                               ["txt"],
  "text/csv":                                                                 ["csv"],
}

// MIME types that file-type cannot detect (plain text files have no magic bytes)
const TEXT_BASED_MIMES = new Set(["text/plain", "text/csv"])

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req: any, file: Express.Multer.File) => {
    // PDFs and Office docs must be stored as "raw" so Cloudinary
    // serves them with the correct Content-Type and the browser can open them.
    // Images can stay as "image" for preview/transform support.
    const imageTypes = ["image/png", "image/jpeg", "image/jpg"]
    const resourceType = imageTypes.includes(file.mimetype) ? "image" : "raw"

    return {
      folder: "printshop-files",
      resource_type: resourceType,
      allowed_formats: [
        "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx",
        "png", "jpg", "jpeg", "txt", "csv",
      ],
    }
  },
})

// Dangerous byte sequences to scan for inside ANY file buffer (polyglot detection)
// These signatures should never appear inside a legitimate PDF/image/Office doc
const DANGEROUS_SIGNATURES = [
  { label: "Windows EXE (MZ header)",  bytes: Buffer.from([0x4d, 0x5a]) },                         // MZ
  { label: "ELF executable",           bytes: Buffer.from([0x7f, 0x45, 0x4c, 0x46]) },             // \x7fELF
  { label: "Mach-O binary",            bytes: Buffer.from([0xfe, 0xed, 0xfa, 0xce]) },             // macOS 32-bit
  { label: "Mach-O binary (64-bit)",   bytes: Buffer.from([0xfe, 0xed, 0xfa, 0xcf]) },             // macOS 64-bit
  { label: "Java class file",          bytes: Buffer.from([0xca, 0xfe, 0xba, 0xbe]) },             // .class
  { label: "Shell script",             bytes: Buffer.from([0x23, 0x21]) },                         // #!
]

/**
 * Scans entire buffer for dangerous byte sequences (polyglot / embedded payload detection).
 * A valid PDF will never contain a raw MZ/ELF header embedded inside it.
 */
function containsDangerousPayload(buffer: Buffer): string | null {
  // Skip the first 4 bytes (that's the file's own magic bytes we already validated)
  const scanFrom = 4
  for (const sig of DANGEROUS_SIGNATURES) {
    const idx = buffer.indexOf(sig.bytes, scanFrom)
    if (idx !== -1) {
      return `${sig.label} signature found at byte offset ${idx}`
    }
  }
  return null
}

/**
 * fileFilter runs BEFORE the file is uploaded to Cloudinary.
 * It reads the file buffer and checks:
 *  1. Actual magic bytes (not just extension or Content-Type header)
 *  2. Dangerous MIME types (exe, dll, sh, bat, zip, etc.)
 *  3. Embedded dangerous payloads inside the buffer (polyglot files)
 */
const fileFilter = async (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  try {
    // Collect the incoming stream into a buffer so we can inspect bytes
    const chunks: Buffer[] = []
    await new Promise<void>((resolve, reject) => {
      file.stream.on("data", (chunk: Buffer) => chunks.push(chunk))
      file.stream.on("end", resolve)
      file.stream.on("error", reject)
    })
    const buffer = Buffer.concat(chunks)

    // Attach buffer back so multer-storage-cloudinary can still upload it
    ;(file as any).buffer = buffer

    // --- Guard: reject suspiciously tiny files (< 10 bytes can't be valid documents) ---
    if (buffer.length < 10) {
      return cb(new Error(`File "${file.originalname}" is too small to be a valid document.`))
    }

    const detectedType = await fromBuffer(buffer)

    // --- Case 1: file-type detected a type (binary files like PDF, images, Office docs) ---
    if (detectedType) {
      const allowedExtensions = Object.values(ALLOWED_MIME_TYPES).flat()

      // Block dangerous types regardless of extension (exe, dll, sh, zip-bombs, etc.)
      const dangerousMimes = [
        "application/x-msdownload",    // .exe / .dll
        "application/x-executable",
        "application/x-dosexec",
        "application/x-sh",
        "application/x-bat",
        "application/zip",             // block bare zips
        "application/x-rar-compressed",
        "application/x-7z-compressed",
      ]

      if (dangerousMimes.includes(detectedType.mime)) {
        return cb(
          new Error(
            `Blocked: "${file.originalname}" is a ${detectedType.ext.toUpperCase()} file disguised as a document.`
          )
        )
      }

      // Reject if detected type is not in our allowed list at all
      if (!allowedExtensions.includes(detectedType.ext)) {
        return cb(
          new Error(
            `File type not allowed. Detected: ${detectedType.mime} (.${detectedType.ext})`
          )
        )
      }

      // --- Polyglot check: scan full buffer for embedded executable payloads ---
      const embeddedThreat = containsDangerousPayload(buffer)
      if (embeddedThreat) {
        return cb(
          new Error(
            `Blocked: "${file.originalname}" contains an embedded executable payload. (${embeddedThreat})`
          )
        )
      }

      return cb(null, true)
    }

    // --- Case 2: file-type returned undefined (plain text / CSV — no magic bytes) ---
    // Only trust declared MIME for known text-only types
    const declaredMime = file.mimetype
    if (TEXT_BASED_MIMES.has(declaredMime)) {
      // Text files can't execute, but still scan for shell shebangs embedded in "CSV"
      const embeddedThreat = containsDangerousPayload(buffer)
      if (embeddedThreat) {
        return cb(new Error(`Blocked: "${file.originalname}" contains a suspicious payload.`))
      }
      return cb(null, true)
    }

    // If file-type couldn't detect AND it's not a known text type → reject
    return cb(
      new Error(
        `Could not verify file type for "${file.originalname}". Only PDF, Office documents, images, TXT and CSV are allowed.`
      )
    )
  } catch (err: any) {
    return cb(new Error("File validation error: " + err.message))
  }
}

export const upload = multer({
  storage,
  fileFilter: fileFilter as any,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB per file
    files: 5,                    // max 5 files per request
  },
})
