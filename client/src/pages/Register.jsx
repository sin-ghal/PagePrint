import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import toast from "react-hot-toast"
import Typewriter from "typewriter-effect"
import API from "../services/api"

const Register = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    shopName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    shopAddress: "",
  })
  const [otp, setOtp] = useState("")

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSendOtp = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.shopName || !formData.email || !formData.password || !formData.confirmPassword || !formData.phone || !formData.shopAddress) {
      return toast.error("All fields are required")
    }
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match")
    }
    setLoading(true)
    try {
      const res = await API.post("/auth/send-otp", { email: formData.email })
      if (res.data.success) {
        toast.success("OTP sent to your email")
        setStep(2)
      }
    } catch (err) {
      console.log("OTP Error:", err)
      toast.error(err.response?.data?.message || "Failed to send OTP")
    }
    setLoading(false)
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    if (!otp) return toast.error("Enter OTP")
    setLoading(true)
    try {
      const res = await API.post("/auth/signup", { ...formData, otp })
      if (res.data.success) {
        toast.success("Registered successfully!")
        navigate("/login")
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#f8f9fa" }}>
      {/* Left Side - Branding */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-start pt-16 px-12 relative overflow-hidden"
        style={{ backgroundColor: "#e8e8e8" }}
      >
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full" style={{ background: "radial-gradient(circle, rgba(192,57,43,0.1) 0%, transparent 70%)" }}></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full" style={{ background: "radial-gradient(circle, rgba(192,57,43,0.08) 0%, transparent 70%)" }}></div>
        <div className="absolute top-1/4 right-20 w-3 h-3 rounded-full" style={{ backgroundColor: "rgba(192,57,43,0.4)" }}></div>
        <div className="absolute top-1/3 left-16 w-2 h-2 rounded-full" style={{ backgroundColor: "rgba(192,57,43,0.3)" }}></div>
        <div className="absolute bottom-1/4 left-24 w-4 h-4 rounded-full" style={{ backgroundColor: "rgba(192,57,43,0.25)" }}></div>
        <div className="absolute bottom-1/3 right-16 w-2 h-2 rounded-full" style={{ backgroundColor: "rgba(192,57,43,0.3)" }}></div>
        <div className="absolute top-16 right-1/3 w-20 h-20 rounded-full" style={{ border: "1px solid rgba(192,57,43,0.12)" }}></div>
        <div className="absolute bottom-20 left-1/4 w-32 h-32 rounded-full" style={{ border: "1px solid rgba(192,57,43,0.1)" }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full" style={{ border: "1px solid rgba(192,57,43,0.06)" }}></div>
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center z-10">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 shadow-md"
            style={{ backgroundColor: "#e8f4f8" }}
          >
            <span className="text-4xl">🖨️</span>
          </div>
          <h1 className="text-3xl font-bold" style={{ color: "#1a1a2e" }}>Page<span style={{ color: "#c0392b" }}>Print</span></h1>
          <p style={{ color: "#c0392b" }} className="text-sm font-medium mt-1">Simple. Fast. Paper.</p>
        </div>

        {/* Feature Cards */}
        <div className="w-full max-w-sm space-y-3 z-10">
          <div className="flex items-center gap-4 p-4 rounded-xl shadow-sm" style={{ backgroundColor: "#fff" }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#fdecea" }}>
              <span className="text-lg">📱</span>
            </div>
            <div>
              <h4 className="font-semibold text-sm" style={{ color: "#1a1a2e" }}>Scan QR</h4>
              <p className="text-xs" style={{ color: "#6b7280" }}>No app download needed</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl shadow-sm" style={{ backgroundColor: "#fff" }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#fef3e2" }}>
              <span className="text-lg">📄</span>
            </div>
            <div>
              <h4 className="font-semibold text-sm" style={{ color: "#1a1a2e" }}>Upload Files</h4>
              <p className="text-xs" style={{ color: "#6b7280" }}>PDF, Word, Images & more</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl shadow-sm" style={{ backgroundColor: "#fff" }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#fdecea" }}>
              <span className="text-lg">⚡</span>
            </div>
            <div>
              <h4 className="font-semibold text-sm" style={{ color: "#1a1a2e" }}>Instant Print</h4>
              <p className="text-xs" style={{ color: "#6b7280" }}>Real-time job notifications</p>
            </div>
          </div>
        </div>

        {/* Tagline */}
        <div className="mt-10 max-w-sm text-center z-10">
          <div className="text-2xl" style={{ color: "#c0392b", fontWeight: "700" }}>
            <Typewriter
              options={{
                strings: [
                  `Print Smarter. Not Harder🖨️<br/>
       No App. Just Scan.<br/>
       Upload. Print. Done✔️`
                ],
                autoStart: true,
                loop: true,
                delay: 80,
                deleteSpeed: 50,
              }}
            />
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <span className="text-4xl">🖨️</span>
            <h1 className="text-2xl font-bold mt-2" style={{ color: "#1a1a2e" }}>Page<span style={{ color: "#c0392b" }}>Print</span></h1>
          </div>

          <div>
            <a href="/" className="text-sm mb-4 inline-block transition hover:underline hover:scale-105" style={{ color: "#c0392b" }}>← Home</a>
            <h2 className="text-2xl font-bold mb-1" style={{ color: "#1a1a2e" }}>
              {step === 1 ? "Create your account" : "Verify Email"}
            </h2>
            <p className="text-sm mb-6" style={{ color: "#6b7280" }}>
              {step === 1
                ? "Register your shop and get your QR code"
                : `Enter the 6-digit code sent to ${formData.email}`}
            </p>

            {/* Progress indicator */}
            <div className="flex items-center gap-2 mb-6">
              <div className="h-1 flex-1 rounded-full" style={{ backgroundColor: step >= 1 ? "#c0392b" : "#e5e7eb" }}></div>
              <div className="h-1 flex-1 rounded-full" style={{ backgroundColor: step >= 2 ? "#c0392b" : "#e5e7eb" }}></div>
            </div>

            {step === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block" style={{ color: "#374151" }}>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-lg text-sm transition"
                      style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", outline: "none" }}
                      onFocus={(e) => e.target.style.borderColor = "#c0392b"}
                      onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block" style={{ color: "#374151" }}>Shop Name</label>
                    <input
                      type="text"
                      name="shopName"
                      value={formData.shopName}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-lg text-sm transition"
                      style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", outline: "none" }}
                      onFocus={(e) => e.target.style.borderColor = "#c0392b"}
                      onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                      placeholder="My Print Shop"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block" style={{ color: "#374151" }}>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-lg text-sm transition"
                    style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", outline: "none" }}
                    onFocus={(e) => e.target.style.borderColor = "#c0392b"}
                    onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                    placeholder="you@email.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block" style={{ color: "#374151" }}>Password</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-lg text-sm transition"
                      style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", outline: "none" }}
                      onFocus={(e) => e.target.style.borderColor = "#c0392b"}
                      onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block" style={{ color: "#374151" }}>Confirm Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-lg text-sm transition"
                      style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", outline: "none" }}
                      onFocus={(e) => e.target.style.borderColor = "#c0392b"}
                      onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block" style={{ color: "#374151" }}>Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-lg text-sm transition"
                    style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", outline: "none" }}
                    onFocus={(e) => e.target.style.borderColor = "#c0392b"}
                    onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                    placeholder="9876543210"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block" style={{ color: "#374151" }}>Shop Address</label>
                  <input
                    type="text"
                    name="shopAddress"
                    value={formData.shopAddress}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-lg text-sm transition"
                    style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", outline: "none" }}
                    onFocus={(e) => e.target.style.borderColor = "#c0392b"}
                    onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                    placeholder="Sector 5, Shop #12, City"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg font-semibold transition-all mt-2 cursor-pointer active:scale-95 hover:shadow-lg"
                  style={{ backgroundColor: loading ? "#7f1d1d" : "#c0392b", color: "#fff", opacity: loading ? 0.8 : 1 }}
                  onMouseEnter={(e) => { if(!loading) e.target.style.backgroundColor = "#a93226" }}
                  onMouseLeave={(e) => { if(!loading) e.target.style.backgroundColor = "#c0392b" }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      Sending OTP...
                    </span>
                  ) : "Continue — Send OTP →"}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleSignup} className="space-y-5">
                <div className="rounded-xl p-4 text-center" style={{ backgroundColor: "#fdecea", border: "1px solid #f5c6cb" }}>
                  <p className="text-sm" style={{ color: "#c0392b" }}>
                    📧 Code sent to <span className="font-bold">{formData.email}</span>
                  </p>
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="● ● ● ● ● ●"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    className="w-full px-4 py-4 rounded-xl text-center text-2xl font-mono"
                    style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", letterSpacing: "0.5em", outline: "none" }}
                    onFocus={(e) => e.target.style.borderColor = "#c0392b"}
                    onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg font-semibold transition-all"
                  style={{ backgroundColor: "#c0392b", color: "#fff", opacity: loading ? 0.5 : 1 }}
                >
                  {loading ? "Verifying..." : "✓ Verify & Create Account"}
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    const toastId = toast.loading("Resending OTP...")
                    try {
                      const res = await API.post("/auth/send-otp", { email: formData.email })
                      if (res.data.success) toast.success("OTP resent!", { id: toastId })
                    } catch (err) {
                      toast.error(err.response?.data?.message || "Wait 1 minute before resending", { id: toastId })
                    }
                  }}
                  className="w-full text-sm font-medium transition hover:underline cursor-pointer"
                  style={{ color: "#c0392b", background: "none", border: "none" }}
                >
                  Resend OTP
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-sm transition"
                  style={{ color: "#6b7280", background: "none", border: "none", cursor: "pointer" }}
                >
                  ← Back to form
                </button>
              </form>
            )}
          </div>

          <p className="text-center text-sm mt-6" style={{ color: "#6b7280" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#c0392b", fontWeight: 600 }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
