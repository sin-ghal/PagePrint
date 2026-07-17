const multer = require("multer")
const { CloudinaryStorage } = require("multer-storage-cloudinary")
const cloudinary = require("cloudinary").v2 

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
      "csv",],
    resource_type: "auto",
  },
})

exports.upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
})

