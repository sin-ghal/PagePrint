const https = require("https")

exports.mailSender = async (email, title, body) => {
  try {
    const data = JSON.stringify({
      sender: { name: "PrintDrop", email: "saswm1427@gmail.com" },
      to: [{ email: email }],
      subject: title,
      htmlContent: body,
    })

    const result = await new Promise((resolve, reject) => {
      const req = https.request(
        {
          hostname: "api.brevo.com",
          path: "/v3/smtp/email",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": process.env.BREVO_API_KEY,
          },
        },
        (res) => {
          let responseData = ""
          res.on("data", (chunk) => (responseData += chunk))
          res.on("end", () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(JSON.parse(responseData))
            } else {
              reject(new Error(`Brevo API error: ${res.statusCode} - ${responseData}`))
            }
          })
        }
      )
      req.on("error", reject)
      req.write(data)
      req.end()
    })

    console.log("Email sent:", result)
    return result
  } catch (e) {
    console.log("MAIL SEND ERROR:", e.message)
    throw e
  }
}
