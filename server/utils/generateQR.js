const QRCode = require("qrcode")

require("dotenv").config()

exports.generateQR = async (shopSlug) => {
  try {
    const url = `${process.env.FRONTEND_URL}/shop/${shopSlug}`
    const qrDataUrl = await QRCode.toDataURL(url)
    return qrDataUrl

  } catch (error) {
    console.error("QR generation error:", error.message)
    throw error
  }
}
