import multer from "multer"
import { v2 as cloudinary } from "cloudinary"
import { fromBuffer } from "file-type"
import { Request, Response, NextFunction } from "express"

// ─── Allowed types ────────────────────────────────────────────────────────────
const ALLOWED_EXTENSIONS = new Set([
  "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx",
  "png", "jpg", "jpeg", "txt", "csv",
])

const TEXT_BASED_MIMES = new Set(["text/plain", "text/csv"])

const DANGEROUS_MIMES = new Set([
  "application/x-msdownload",
  "application/x-executable",
  "application/x-dosexec",
  "application/x-sh",
  "application/x-bat",
  "application/zip",
  "application/x-rar-compressed",
  "application/x-7z-compressed",
])

const DANGEROUS_SIGNATURES = [
  { label: "Windows EXE (MZ header)",  bytes: Buffer.from([0x4d, 0x5a]) },
  { label: "ELF executable",           bytes: Buffer.from([0x7f, 0x45, 0x4c, 0x46]) },
  { label: "Mach-O binary",            bytes: Buffer.from([0xfe, 0xed, 0xfa, 0xce]) },
  { label: "Mach-O binary (64-bit)",   bytes: Buffer.from([0xfe, 0xed, 0xfa, 0xcf]) },
  { label: "Java class file",          bytes: Buffer.from([0xca, 0xfe, 0xba, 0xbe]) },
  { label: "Shell script",             bytes: Buffer.from([0x23, 0x21]) },
]

function containsDangerousPayload(buffer: Buffer): string | null {
  const scanFrom = 4
  for (const sig of DANGEROUS_SIGNATURES) {
    const idx = buffer.indexOf(sig.bytes, scanFrom)
    if (idx !== -1) return `${sig.label} signature found at byte offset ${idx}`
  }
  return null
}

// ─── Step 1: multer just collects files into memory ──────────────────────────
// No fileFilter here — we validate in the middleware below after buffer is ready
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB per file
    files: 5,
  },
})

// ─── Step 2: validate + upload to Cloudinary ─────────────────────────────────
// Use this middleware AFTER upload.array("files") in the route
export const validateAndUploadToCloudinary = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[]
    if (!files || files.length === 0) { next(); return }

    const uploadedFiles: any[] = []

    for (const file of files) {
      const buffer = file.buffer

      // Guard: too small
      if (buffer.length < 10) {
        res.status(400).json({ success: false, message: `File "${file.originalname}" is too small to be valid.` })
        return
      }

      const detectedType = await fromBuffer(buffer)

      if (detectedType) {
        // Block dangerous MIME types
        if (DANGEROUS_MIMES.has(detectedType.mime)) {
          res.status(400).json({ success: false, message: `Blocked: "${file.originalname}" is a dangerous file type.` })
          return
        }

        // Block unknown types
        if (!ALLOWED_EXTENSIONS.has(detectedType.ext)) {
          res.status(400).json({ success: false, message: `File type not allowed: .${detectedType.ext}` })
          return
        }

        // Polyglot check
        const threat = containsDangerousPayload(buffer)
        if (threat) {
          res.status(400).json({ success: false, message: `Blocked: "${file.originalname}" contains an embedded payload.` })
          return
        }
      } else {
        // No magic bytes — only allow known text types
        if (!TEXT_BASED_MIMES.has(file.mimetype)) {
          res.status(400).json({ success: false, message: `Could not verify file type for "${file.originalname}".` })
          return
        }

        const threat = containsDangerousPayload(buffer)
        if (threat) {
          res.status(400).json({ success: false, message: `Blocked: "${file.originalname}" contains a suspicious payload.` })
          return
        }
      }

      // ── Upload buffer to Cloudinary ──────────────────────────────────────
      const imageTypes = ["image/png", "image/jpeg", "image/jpg"]
      const resourceType = imageTypes.includes(file.mimetype) ? "image" : "raw"

      const result = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "printshop-files",
            resource_type: resourceType,
            public_id: `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`,
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        )
        stream.end(buffer)
      })

      uploadedFiles.push({
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: result.secure_url,       // Cloudinary URL
        filename: result.public_id,    // Cloudinary public_id for deletion
      })
    }

    // Replace req.files with our enriched array so the controller works as before
    ;(req as any).files = uploadedFiles
    next()
  } catch (err: any) {
    console.error("Upload middleware error:", err)
    res.status(500).json({ success: false, message: "File upload failed: " + err.message })
  }
}
