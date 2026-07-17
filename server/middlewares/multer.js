const multer = require("multer")
const { CloudinaryStorage } = require("multer-storage-cloudinary")
const cloudinary = require("cloudinary").v2 

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    const ext = file.originalname.split(".").pop().toLowerCase()
    const isImage = ["png", "jpg", "jpeg"].includes(ext)

    return {
      folder: "printshop-files",
      resource_type: isImage ? "image" : "raw",
      allowed_formats: ["pdf","doc","docx","xls","xlsx","ppt","pptx","png","jpg","jpeg","txt","csv"],
    }
  },
})

exports.upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
})

