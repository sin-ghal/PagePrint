const nodemailer = require("nodemailer")
require("dotenv").config()

exports.mailSender = async (email, title, body) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    })

    const info = await transporter.sendMail({
      from: `"Print Shop QR" <${process.env.MAIL_USER}>`,
      to: email,
      subject: title,
      html: body,
    })

    console.log("Email sent:", info.messageId)
    return info
  } catch (error) {
    console.error("Email error:", error.message)
    throw error
  }
}