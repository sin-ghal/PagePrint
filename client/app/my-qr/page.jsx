"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import API from "../../services/api"

export default function MyQRPage() {
  const router = useRouter()
  const [qrCode, setQrCode] = useState("")
  const [shopName, setShopName] = useState("")
  const [shopSlug, setShopSlug] = useState("")
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState("")

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    if (!storedToken) {
      router.push("/login")
      return
    }
    setToken(storedToken)
  }, [router])

  useEffect(() => {
    if (!token) return
    fetchQR()
  }, [token])

  const fetchQR = async () => {
    try {
      const res = await API.get("/shopkeeper/my-qr", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.data.success) {
        setQrCode(res.data.qrCode)
        setShopName(res.data.shopName)
        setShopSlug(res.data.shopSlug)
      }
    } catch (err) {
      toast.error("Failed to load QR")
    }
    setLoading(false)
  }

  const downloadQR = () => {
    const link = document.createElement("a")
    link.href = qrCode
    link.download = `${shopName}-QR.png`
    link.click()
    toast.success("QR downloaded!")
  }

  const printQR = () => {
    const printWindow = window.open("", "_blank")
    printWindow.document.write(`
      <html>
        <head>
          <title>${shopName} - QR Code</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              font-family: Arial, sans-serif;
            }
            .container {
              text-align: center;
              border: 3px solid #c0392b;
              border-radius: 20px;
              padding: 40px;
              max-width: 400px;
            }
            h1 { color: #c0392b; margin-bottom: 10px; }
            p { color: #666; margin-bottom: 20px; }
            img { width: 280px; height: 280px; }
            .footer { margin-top: 20px; color: #999; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🖨️ ${shopName}</h1>
            <p>Scan to upload your print files</p>
            <img src="${qrCode}" alt="QR Code" />
            <p class="footer">No app needed • Just scan & upload</p>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.onload = () => {
      printWindow.print()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f8f9fa" }}>
        <p style={{ color: "#6b7280" }}>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8f9fa" }}>
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 shadow-sm" style={{ backgroundColor: "#fff", borderBottom: "1px solid #e5e7eb" }}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🖨️</span>
          <h1 className="text-xl font-bold" style={{ color: "#1a1a2e" }}>Page<span style={{ color: "#c0392b" }}>Print</span></h1>
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer"
          style={{ color: "#c0392b", border: "1px solid rgba(192,57,43,0.2)" }}
        >
          ← Back to Dashboard
        </button>
      </nav>

      <div className="max-w-lg mx-auto px-6 py-12">
        {/* QR Card */}
        <div className="p-8 rounded-2xl text-center" style={{ background: "linear-gradient(135deg, #fff 0%, #fef2f0 100%)", border: "2px solid rgba(192,57,43,0.2)", boxShadow: "0 4px 20px rgba(192,57,43,0.08)" }}>
          <h2 className="text-2xl font-bold mb-2" style={{ color: "#c0392b" }}>
            🏪 {shopName}
          </h2>
          <p className="text-sm mb-6" style={{ color: "#6b7280" }}>
            Scan to upload print files
          </p>

          {qrCode && (
            <div className="inline-block p-4 rounded-xl mb-6" style={{ backgroundColor: "#fff", border: "1px solid #e5e7eb" }}>
              <img src={qrCode} alt="Shop QR Code" className="w-64 h-64" />
            </div>
          )}

          <p className="text-xs mb-6" style={{ color: "#9ca3af" }}>
            Your link: page-print.vercel.app/shop/{shopSlug}
          </p>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={downloadQR}
              className="px-6 py-3 rounded-xl font-medium transition hover:shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
              style={{ backgroundColor: "#c0392b", color: "#fff" }}
            >
              📥 Download QR
            </button>
            <button
              onClick={printQR}
              className="px-6 py-3 rounded-xl font-medium transition hover:shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
              style={{ backgroundColor: "#fff", color: "#c0392b", border: "1px solid rgba(192,57,43,0.3)" }}
            >
              🖨️ Print Banner
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 p-6 rounded-xl" style={{ backgroundColor: "#fff", border: "1px solid #e5e7eb" }}>
          <h3 className="font-bold mb-3" style={{ color: "#1a1a2e" }}>How to use:</h3>
          <div className="space-y-2 text-sm" style={{ color: "#6b7280" }}>
            <p>1. Download or print this QR code</p>
            <p>2. Stick it on your counter, wall, or door</p>
            <p>3. Customers scan with phone camera</p>
            <p>4. They upload files directly to your dashboard</p>
            <p>5. You get notified instantly!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
