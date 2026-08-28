import multer from "multer"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import { v2 as cloudinary } from "cloudinary"

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "printshop-files",
    allowed_formats: [
      "pdf",
      "doc",
      "docx",
      "xls",
      "xlsx",
      "ppt",
      "pptx",
      "png",
      "jpg",
      "jpeg",
      "txt",
      "csv",
    ],
    resource_type: "auto",
  } as any,
})

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
})
