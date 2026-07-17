const multer = require("multer")
const { CloudinaryStorage } = require("multer-storage-cloudinary")
const cloudinary = require("cloudinary").v2 

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    const ext = file.originalname.split(".").pop().toLowerCase()
    const rawExts = ["doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "csv"]

    return {
      folder: "printshop-files",
      resource_type: rawExts.includes(ext) ? "raw" : "image",
      allowed_formats: ["pdf","doc","docx","xls","xlsx","ppt","pptx","png","jpg","jpeg","txt","csv"],
    }
  },
})

exports.upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
})

