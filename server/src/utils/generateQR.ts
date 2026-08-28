import QRCode from "qrcode"
import dotenv from "dotenv"

dotenv.config()

export const generateQR = async (shopSlug: string): Promise<string> => {
  try {
    const url = `${process.env.FRONTEND_URL}/shop/${shopSlug}`
    const qrDataUrl = await QRCode.toDataURL(url)
    return qrDataUrl
  } catch (error: any) {
    console.error("QR generation error:", error.message)
    throw error
  }
}
