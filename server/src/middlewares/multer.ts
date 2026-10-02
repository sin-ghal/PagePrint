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

// Mid-file binary scanning was removed — it caused too many false positives on
// legitimate PDFs (fonts/compressed streams contain MZ bytes) and WhatsApp
// JPEGs (EXIF data contains #! bytes). Protection comes from:
//   1. Magic-byte detection via file-type (detectedType check below)
//   2. Dangerous MIME type blocklist
//   3. Extension allowlist

// ─── Step 1: multer collects files into memory ───────────────────────────────
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB per file
    files: 5,
  },
})

// ─── Step 2: validate + upload to Cloudinary ─────────────────────────────────
// Used AFTER upload.array("files") in the route
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

      // Guard: too small to be a valid document
      if (buffer.length < 10) {
        res.status(400).json({ success: false, message: `File "${file.originalname}" is too small to be valid.` })
        return
      }

      const detectedType = await fromBuffer(buffer)

      if (detectedType) {
        // Block dangerous MIME types (exe, dll, zip, etc.)
        if (DANGEROUS_MIMES.has(detectedType.mime)) {
          res.status(400).json({ success: false, message: `Blocked: "${file.originalname}" is a dangerous file type.` })
          return
        }

        // Block anything not in our allowlist
        if (!ALLOWED_EXTENSIONS.has(detectedType.ext)) {
          res.status(400).json({ success: false, message: `File type not allowed: .${detectedType.ext}` })
          return
        }
      } else {
        // file-type returned undefined — no magic bytes (plain text / CSV)
        // Only allow known text-based MIME types
        if (!TEXT_BASED_MIMES.has(file.mimetype)) {
          res.status(400).json({ success: false, message: `Could not verify file type for "${file.originalname}".` })
          return
        }
      }

      // ── Upload buffer directly to Cloudinary ─────────────────────────────
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
        path: result.secure_url,    // Cloudinary URL
        filename: result.public_id, // Cloudinary public_id for deletion later
      })
    }

    // Replace req.files with enriched array — controller stays unchanged
    ;(req as any).files = uploadedFiles
    next()
  } catch (err: any) {
    console.error("Upload middleware error:", err)
    res.status(500).json({ success: false, message: "File upload failed: " + err.message })
  }
}
