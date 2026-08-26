"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import toast from "react-hot-toast"
import API from "../../services/api"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")

  const handleSendOtp = async (e) => {
    e.preventDefault()
    if (!email) return toast.error("Enter your email")
    setLoading(true)
    try {
      const res = await API.post("/auth/send-otp", { email })
      if (res.data.success) {
        toast.success("OTP sent to your email")
        setStep(2)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP")
    }
    setLoading(false)
  }

  const handleReset = async (e) => {
    e.preventDefault()
    if (!otp || !newPassword) return toast.error("All fields required")
    if (newPassword.length < 6) return toast.error("Password must be 6+ characters")
    setLoading(true)
    try {
      const res = await API.post("/auth/reset-password", { email, otp, newPassword })
      if (res.data.success) {
        toast.success("Password reset! Please login.")
        router.push("/login")
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f8f9fa" }}>
      <div className="w-full max-w-md px-6">
        <div className="text-center mb-8">
          <span className="text-4xl">🖨️</span>
          <h1 className="text-2xl font-bold mt-2" style={{ color: "#1a1a2e" }}>Page<span style={{ color: "#c0392b" }}>Print</span></h1>
        </div>

        <div className="p-8 rounded-2xl" style={{ backgroundColor: "#fff", border: "1px solid #e5e7eb" }}>
          <Link href="/login" className="text-sm mb-4 inline-block transition hover:underline" style={{ color: "#c0392b" }}>← Back to Login</Link>
          
          <h2 className="text-xl font-bold mb-1" style={{ color: "#1a1a2e" }}>
            {step === 1 ? "Forgot Password?" : "Reset Password"}
          </h2>
          <p className="text-sm mb-6" style={{ color: "#6b7280" }}>
            {step === 1 ? "Enter your email to receive OTP" : `Enter OTP sent to ${email}`}
          </p>

          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block" style={{ color: "#374151" }}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-lg text-sm"
                  style={{ border: "1px solid #e5e7eb", outline: "none" }}
                  onFocus={(e) => e.target.style.borderColor = "#c0392b"}
                  onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                  placeholder="you@email.com"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg font-semibold transition hover:shadow-lg hover:scale-[1.02] active:scale-95 cursor-pointer"
                style={{ backgroundColor: "#c0392b", color: "#fff", opacity: loading ? 0.7 : 1 }}
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block" style={{ color: "#374151" }}>OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  className="w-full px-3.5 py-3 rounded-lg text-sm text-center tracking-widest"
                  style={{ border: "1px solid #e5e7eb", outline: "none" }}
                  onFocus={(e) => e.target.style.borderColor = "#c0392b"}
                  onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                  placeholder="Enter 6-digit OTP"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block" style={{ color: "#374151" }}>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-lg text-sm"
                  style={{ border: "1px solid #e5e7eb", outline: "none" }}
                  onFocus={(e) => e.target.style.borderColor = "#c0392b"}
                  onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                  placeholder="New password (min 6 chars)"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg font-semibold transition hover:shadow-lg hover:scale-[1.02] active:scale-95 cursor-pointer"
                style={{ backgroundColor: "#c0392b", color: "#fff", opacity: loading ? 0.7 : 1 }}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-sm transition cursor-pointer"
                style={{ color: "#6b7280", background: "none", border: "none" }}
              >
                ← Change email
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm mt-5" style={{ color: "#6b7280" }}>
          Remember your password?{" "}
          <Link href="/login" style={{ color: "#c0392b", fontWeight: 600 }}>Login</Link>
        </p>
      </div>
    </div>
  )
}
