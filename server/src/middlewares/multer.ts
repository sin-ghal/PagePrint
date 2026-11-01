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

// ─── Step 1: multer collects files into memory ───────────────────────────────
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB per file
    files: 5,
  },
})

// ─── Step 2: validate + upload to Cloudinary ─────────────────────────────────
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
      const fileExt = file.originalname.split(".").pop()?.toLowerCase() || ""

      if (detectedType) {
        // Block dangerous MIME types
        if (DANGEROUS_MIMES.has(detectedType.mime)) {
          res.status(400).json({ success: false, message: `Blocked: "${file.originalname}" is a dangerous file type.` })
          return
        }

        // Check against allowlist (by detected ext OR original filename ext)
        if (!ALLOWED_EXTENSIONS.has(detectedType.ext) && !ALLOWED_EXTENSIONS.has(fileExt)) {
          res.status(400).json({ success: false, message: `File type not allowed: .${detectedType.ext}` })
          return
        }
      } else {
        // file-type returned undefined (e.g. plain text, CSV, or certain document types)
        if (!TEXT_BASED_MIMES.has(file.mimetype) && !ALLOWED_EXTENSIONS.has(fileExt)) {
          res.status(400).json({ success: false, message: `Could not verify file type for "${file.originalname}".` })
          return
        }
      }

      // ── Upload buffer directly to Cloudinary ─────────────────────────────
      const imageTypes = ["image/png", "image/jpeg", "image/jpg"]
      const resourceType = imageTypes.includes(file.mimetype) ? "image" : "raw"

      // Strip existing extension & sanitize all non-alphanumeric chars to prevent Cloudinary invalid public_id errors
      const cleanBaseName = file.originalname
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .replace(/_+/g, "_")
        .slice(0, 50) || "file"

      // For "raw" files (PDFs, Office Docs), Cloudinary needs the extension in public_id
      const publicId = resourceType === "raw" && fileExt
        ? `${Date.now()}-${cleanBaseName}.${fileExt}`
        : `${Date.now()}-${cleanBaseName}`

      const result = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "printshop-files",
            resource_type: resourceType,
            public_id: publicId,
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
        resourceType,               // needed for correct deletion
      })
    }

    // Replace req.files with enriched array
    ;(req as any).files = uploadedFiles
    next()
  } catch (err: any) {
    console.error("Upload middleware error:", err)
    res.status(500).json({ success: false, message: "File upload failed: " + (err.message || "Unknown error") })
  }
}

// ─── Multer-specific error handler ───────────────────────────────────────────
export const multerErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({ success: false, message: "File exceeds 10MB limit." })
      return
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      res.status(400).json({ success: false, message: "Maximum 5 files allowed." })
      return
    }
    res.status(400).json({ success: false, message: `Upload error: ${err.message}` })
    return
  }
  next(err)
}
