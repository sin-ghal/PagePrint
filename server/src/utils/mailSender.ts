import https from "https"

export const mailSender = async (
  email: string,
  title: string,
  body: string
): Promise<any> => {
  try {
    const data = JSON.stringify({
      sender: { name: "PagePrint", email: "saswm1427@gmail.com" },
      to: [{ email }],
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
            "api-key": process.env.BREVO_API_KEY as string,
          },
        },
        (res) => {
          let responseData = ""
          res.on("data", (chunk) => (responseData += chunk))
          res.on("end", () => {
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
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
  } catch (e: any) {
    console.log("MAIL SEND ERROR:", e.message)
    throw e
  }
}
