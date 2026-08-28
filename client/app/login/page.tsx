"use client"

import { useState, FormEvent, ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import toast from "react-hot-toast"
import TaglineTyper from "../../components/TaglineTyper"
import API from "../../services/api"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    if (!formData.email || !formData.password) {
      return toast.error("All fields are required")
    }
    setLoading(true)
    try {
      const res = await API.post("/auth/login", formData)
      if (res.data.success) {
        localStorage.setItem("token", res.data.token)
        localStorage.setItem("user", JSON.stringify(res.data.user))
        toast.success("Login successful!")
        router.push("/dashboard")
      }
    } catch (err: any) {
      console.log("Login Error:", err)
      toast.error(err.response?.data?.message || "Login failed")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#f8f9fa" }}>
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center px-12 relative overflow-hidden" style={{ backgroundColor: "#e8e8e8" }}>
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full" style={{ background: "radial-gradient(circle, rgba(192,57,43,0.1) 0%, transparent 70%)" }}></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full" style={{ background: "radial-gradient(circle, rgba(192,57,43,0.08) 0%, transparent 70%)" }}></div>
        <div className="absolute top-1/4 right-20 w-3 h-3 rounded-full" style={{ backgroundColor: "rgba(192,57,43,0.4)" }}></div>
        <div className="absolute bottom-1/4 left-24 w-4 h-4 rounded-full" style={{ backgroundColor: "rgba(192,57,43,0.25)" }}></div>
        <div className="absolute top-16 right-1/3 w-20 h-20 rounded-full" style={{ border: "1px solid rgba(192,57,43,0.12)" }}></div>
        <div className="absolute bottom-20 left-1/4 w-32 h-32 rounded-full" style={{ border: "1px solid rgba(192,57,43,0.1)" }}></div>

        <div className="mb-8 flex flex-col items-center z-10">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 shadow-md" style={{ backgroundColor: "#e8f4f8" }}>
            <span className="text-4xl">🖨️</span>
          </div>
          <h1 className="text-3xl font-bold" style={{ color: "#1a1a2e" }}>Page<span style={{ color: "#c0392b" }}>Print</span></h1>
          <p style={{ color: "#c0392b" }} className="text-sm font-medium mt-1">Simple. Fast. Paper.</p>
        </div>

        <div className="max-w-sm text-center z-10">
          <p className="text-sm" style={{ color: "#6b7280" }}>Manage your print shop from anywhere. Get real-time job notifications and track everything.</p>
        </div>

        <div className="mt-8 z-10">
          <TaglineTyper />
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <span className="text-4xl">🖨️</span>
            <h1 className="text-2xl font-bold mt-2" style={{ color: "#1a1a2e" }}>Page<span style={{ color: "#c0392b" }}>Print</span></h1>
          </div>

          <div>
            <Link href="/" className="text-sm mb-4 inline-block transition hover:underline hover:scale-105" style={{ color: "#c0392b" }}>← Home</Link>
            <h2 className="text-2xl font-bold mb-1" style={{ color: "#1a1a2e" }}>Welcome back</h2>
            <p className="text-sm mb-8" style={{ color: "#6b7280" }}>Login to your shop dashboard</p>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "#374151" }}>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-3.5 py-3 rounded-lg text-sm transition" style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", outline: "none" }} onFocus={(e) => e.currentTarget.style.borderColor = "#c0392b"} onBlur={(e) => e.currentTarget.style.borderColor = "#e5e7eb"} placeholder="you@email.com" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "#374151" }}>Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-3.5 py-3 rounded-lg text-sm transition" style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", outline: "none" }} onFocus={(e) => e.currentTarget.style.borderColor = "#c0392b"} onBlur={(e) => e.currentTarget.style.borderColor = "#e5e7eb"} placeholder="••••••••" />
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 rounded-lg font-semibold transition-all cursor-pointer active:scale-95 hover:shadow-lg" style={{ backgroundColor: loading ? "#7f1d1d" : "#c0392b", color: "#fff", opacity: loading ? 0.8 : 1 }}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                    Logging in...
                  </span>
                ) : "Login →"}
              </button>
            </form>
          </div>

          <p className="text-center text-sm mt-4" style={{ color: "#6b7280" }}>
            <Link href="/forgot-password" style={{ color: "#c0392b", fontWeight: 500 }}>Forgot Password?</Link>
          </p>
          <p className="text-center text-sm mt-3" style={{ color: "#6b7280" }}>
            Don&apos;t have an account?{" "}
            <Link href="/register" style={{ color: "#c0392b", fontWeight: 600 }}>Register</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
