"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import toast from "react-hot-toast"
import { io } from "socket.io-client"
import API from "../../services/api"

export default function DashboardPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [priceInputs, setPriceInputs] = useState({})
  const [qrCode, setQrCode] = useState("")
  const [user, setUser] = useState({})
  const [token, setToken] = useState("")

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}")
    
    if (!storedToken) {
      router.push("/login")
      return
    }
    
    setToken(storedToken)
    setUser(storedUser)
  }, [router])

  useEffect(() => {
    if (!token) return

    fetchJobs()
    fetchQR()

    // Socket connection
    const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000")
    socket.emit("join-shop", user._id)

    socket.on("new-job", (data) => {
      toast.success(`🖨️ New job received! ${data.files} file(s)`)
      fetchJobs()
    })

    return () => socket.disconnect()
  }, [token])

  const fetchQR = async () => {
    try {
      const res = await API.get("/shopkeeper/my-qr", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.data.success) {
        setQrCode(res.data.qrCode)
      }
    } catch (err) {}
  }

  const fetchJobs = async () => {
    try {
      const res = await API.get("/shopkeeper/my-jobs", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.data.success) {
        setJobs(res.data.jobs)
      }
    } catch (err) {
      toast.error("Failed to load jobs")
    }
    setLoading(false)
  }

  const updateStatus = async (jobId, status) => {
    const toastId = toast.loading(`Updating to ${status}...`)
    try {
      const res = await API.put(`/shopkeeper/update-status/${jobId}`, { status }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.data.success) {
        toast.success(`Status updated to ${status}`, { id: toastId })
        fetchJobs()
      }
    } catch (err) {
      toast.error("Failed to update status", { id: toastId })
    }
  }

  const setPrice = async (jobId) => {
    const price = priceInputs[jobId]
    if (!price || Number(price) <= 0) return toast.error("Enter a valid price")
    try {
      const res = await API.put(`/shopkeeper/set-price/${jobId}`, { price: Number(price) }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.data.success) {
        toast.success("Price set!")
        fetchJobs()
      }
    } catch (err) {
      toast.error("Failed to set price")
    }
  }

  const markPaid = async (jobId) => {
    try {
      const res = await API.put(`/shopkeeper/mark-paid/${jobId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.data.success) {
        toast.success("Marked as paid")
        fetchJobs()
      }
    } catch (err) {
      toast.error("Failed to mark paid")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  const filteredJobs = filter === "all" ? jobs : jobs.filter(j => j.status === filter)

  const statusColors = {
    pending: { bg: "#fef3e2", color: "#f59e0b", label: "⏳ Pending" },
    ready: { bg: "#d1fae5", color: "#10b981", label: "✅ Ready" },
    completed: { bg: "#f3f4f6", color: "#6b7280", label: "✔️ Completed" },
    cancelled: { bg: "#fee2e2", color: "#ef4444", label: "❌ Cancelled" },
  }

  const stats = {
    total: jobs.length,
    pending: jobs.filter(j => j.status === "pending").length,
    completed: jobs.filter(j => j.status === "completed").length,
  }

  const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000)
    if (diff < 60) return "Just now"
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`
    return `${Math.floor(diff / 86400)} days ago`
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8f9fa" }}>
      {/* Navbar */}
      <nav className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 shadow-sm" style={{ backgroundColor: "#fff", borderBottom: "1px solid #e5e7eb" }}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🖨️</span>
          <h1 className="text-xl font-bold" style={{ color: "#1a1a2e" }}>Page<span style={{ color: "#c0392b" }}>Print</span></h1>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/my-qr" className="px-4 py-2 rounded-lg text-sm font-medium transition hover:shadow-lg hover:scale-105 active:scale-95" style={{ backgroundColor: "#fdecea", color: "#c0392b" }}>
            Download QR
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition hover:shadow-lg hover:scale-105 active:scale-95"
            style={{ color: "#6b7280", border: "1px solid #e5e7eb" }}
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Welcome + QR */}
        <div className="mb-8 flex flex-col md:flex-row items-center justify-between p-4 md:p-6 gap-4 rounded-xl" style={{ background: "linear-gradient(135deg, #fff 0%, #fef2f0 50%, #fde8e4 100%)", border: "1px solid rgba(192,57,43,0.25)", boxShadow: "0 4px 20px rgba(192,57,43,0.1)" }}>
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
            {qrCode && (
              <div className="p-2 rounded-xl text-center" style={{ border: "1px solid #e5e7eb" }}>
                <img src={qrCode} alt="Shop QR" className="w-36 h-36 rounded" />
                <p className="text-xs mt-1 font-medium" style={{ color: "#6b7280" }}>Scan here to share files</p>
              </div>
            )}
            <div>
              <p className="text-3xl font-bold" style={{ color: "#c0392b" }}>
                🏪 {user.shopName || "Your Shop"}
              </p>
              <p className="text-base mt-1" style={{ color: "#6b7280" }}>
                📍 {user.shopAddress || ""}
              </p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold" style={{ color: "#1a1a2e" }}>
              👤 Owner: {user.name || "Shopkeeper"}
            </h2>
            <p className="text-lg font-medium mt-1" style={{ color: "#374151" }}>
              📞 {user.phone || ""}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 md:gap-4 mb-8">
          <div className="p-5 rounded-xl" style={{ backgroundColor: "#fff", border: "1px solid #e5e7eb" }}>
            <p className="text-2xl font-bold" style={{ color: "#1a1a2e" }}>{stats.total}</p>
            <p className="text-sm" style={{ color: "#6b7280" }}>Total Jobs</p>
          </div>
          <div className="p-5 rounded-xl" style={{ backgroundColor: "#fff", border: "1px solid #e5e7eb" }}>
            <p className="text-2xl font-bold" style={{ color: "#f59e0b" }}>{stats.pending}</p>
            <p className="text-sm" style={{ color: "#6b7280" }}>Pending</p>
          </div>
          <div className="p-5 rounded-xl" style={{ backgroundColor: "#fff", border: "1px solid #e5e7eb" }}>
            <p className="text-2xl font-bold" style={{ color: "#10b981" }}>{stats.completed}</p>
            <p className="text-sm" style={{ color: "#6b7280" }}>Completed</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-3">
          <div className="flex gap-2 flex-wrap">
            {["all", "pending", "ready", "completed"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition hover:shadow hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: filter === tab ? "#c0392b" : "#fff",
                  color: filter === tab ? "#fff" : "#6b7280",
                  border: filter === tab ? "none" : "1px solid #e5e7eb",
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Jobs */}
        {loading ? (
          <div className="text-center py-20">
            <p style={{ color: "#6b7280" }}>Loading jobs...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">📭</p>
            <p className="text-lg font-medium" style={{ color: "#1a1a2e" }}>No jobs yet</p>
            <p className="text-sm" style={{ color: "#6b7280" }}>Share your QR code with customers to start receiving jobs</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <div key={job._id} className="p-6 rounded-xl" style={{ background: "linear-gradient(135deg, #fff 0%, #fef9f8 100%)", border: "1.5px solid #c0392b" }}>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-bold" style={{ color: "#1a1a2e" }}>📋 {job.jobId}</h3>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: statusColors[job.status]?.bg,
                        color: statusColors[job.status]?.color,
                      }}
                    >
                      {statusColors[job.status]?.label}
                    </span>
                    {job.isPaid && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: "#d1fae5", color: "#10b981" }}>
                        💰 Paid — ₹{job.price}
                      </span>
                    )}
                    {job.price > 0 && !job.isPaid && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium animate-shake" style={{ backgroundColor: "#ef4444", color: "#fff", boxShadow: "0 0 8px rgba(239,68,68,0.5)" }}>
                        ⚠️ ₹{job.price} — Unpaid
                      </span>
                    )}
                    {job.price === 0 && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: "#fee2e2", color: "#ef4444" }}>
                        💰 Price not set
                      </span>
                    )}
                  </div>
                  <span className="text-xs" style={{ color: "#9ca3af" }}>{timeAgo(job.createdAt)}</span>
                </div>

                {/* Files */}
                <div className="mb-4">
                  <div className="space-y-3">
                    {job.files.map((file, i) => (
                      <div key={i} className="p-4 rounded-lg" style={{ backgroundColor: "#f8f9fa", border: "1px solid #e5e7eb" }}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-base" style={{ color: "#1a1a2e" }}>📄 {file.name}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: "#fdecea", color: "#c0392b" }}>{file.copies} copies</span>
                              <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: "#fdecea", color: "#c0392b" }}>{file.colorMode === "bw" ? "B&W" : "Color"}</span>
                              <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: "#fdecea", color: "#c0392b" }}>{file.paperSize}</span>
                              <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: "#fdecea", color: "#c0392b" }}>{file.sides === "single" ? "Single" : "Duplex"}</span>
                              {file.pages !== "all" && <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: "#fdecea", color: "#c0392b" }}>Pages: {file.pages}</span>}
                            </div>
                          </div>
                          {file.url ? (
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noreferrer"
                              className="px-4 py-2 rounded-lg text-sm font-medium ml-4 transition hover:shadow-lg hover:scale-105 active:scale-95"
                              style={{ backgroundColor: "#d25042ff", color: "#fff", textDecoration: "none" }}
                              onClick={(e) => { e.currentTarget.style.backgroundColor = "#10b981"; e.currentTarget.textContent = "✅ Opened" }}
                            >
                              📥 Download
                            </a>
                          ) : (
                            <span className="px-4 py-2 rounded-lg text-sm font-medium ml-4" style={{ backgroundColor: "#f3f4f6", color: "#9ca3af" }}>
                              🗑️ Deleted
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-3" style={{ borderTop: "1px solid #f3f4f6" }}>
                  {(job.price === 0 || !job.isPaid) && (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="₹ Price"
                        value={priceInputs[job.jobId] || ""}
                        onChange={(e) => setPriceInputs({ ...priceInputs, [job.jobId]: e.target.value })}
                        className="w-20 px-2 py-1.5 rounded-lg text-sm"
                        style={{ border: "1px solid #e5e7eb", outline: "none" }}
                      />
                      <button
                        onClick={() => setPrice(job.jobId)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition hover:shadow-lg hover:scale-105 active:scale-95"
                        style={{ backgroundColor: "#c0392b", color: "#fff" }}
                      >
                        {job.price > 0 ? "Update" : "Set"}
                      </button>
                    </div>
                  )}

                  {!job.isPaid && job.price > 0 && (
                    <button
                      onClick={() => markPaid(job.jobId)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition hover:shadow-lg hover:scale-105 active:scale-95"
                      style={{ backgroundColor: "#d1fae5", color: "#10b981" }}
                      onMouseEnter={(e) => { e.target.style.backgroundColor = "#10b981"; e.target.style.color = "#fff" }}
                      onMouseLeave={(e) => { e.target.style.backgroundColor = "#d1fae5"; e.target.style.color = "#10b981" }}
                    >
                      Mark Paid
                    </button>
                  )}

                  {job.status !== "completed" && job.status !== "cancelled" && (
                    <select
                      value={job.status}
                      onChange={(e) => updateStatus(job.jobId, e.target.value)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
                      style={{ border: "1px solid #e5e7eb", outline: "none", color: "#374151" }}
                    >
                      <option value="pending">⏳ Pending</option>
                      <option value="ready">✅ Ready</option>
                      <option value="completed">✔️ Completed</option>
                    </select>
                  )}
                </div>

                {/* Remarks */}
                {job.remarks && (
                  <p className="text-sm mt-3 pt-3" style={{ color: "#6b7280", borderTop: "1px solid #f3f4f6" }}>
                    💬 &ldquo;{job.remarks}&rdquo;
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
