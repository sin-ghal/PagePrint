import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import toast from "react-hot-toast"
import API from "../services/api"

const JobStatus = () => {
  const { jobId } = useParams()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      const res = await API.get(`/customer/status/${jobId}`)
      if (res.data.success) {
        setJob(res.data.job)
      }
    } catch (err) {
      toast.error("Job not found")
    }
    setLoading(false)
  }

  const statusInfo = {
    pending: { icon: "⏳", label: "Pending", desc: "Your job is received. Waiting for the shopkeeper.", color: "#f59e0b", bg: "#fef3e2" },
    ready: { icon: "✅", label: "Ready", desc: "Your print is ready! Pick it up from the shop.", color: "#10b981", bg: "#d1fae5" },
    completed: { icon: "✔️", label: "Completed", desc: "Job done! Thank you.", color: "#6b7280", bg: "#f3f4f6" },
    cancelled: { icon: "❌", label: "Cancelled", desc: "This job was cancelled.", color: "#ef4444", bg: "#fee2e2" },
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f8f9fa" }}>
        <p style={{ color: "#6b7280" }}>Loading...</p>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f8f9fa" }}>
        <div className="text-center">
          <p className="text-5xl mb-4">❌</p>
          <p className="text-xl font-bold" style={{ color: "#1a1a2e" }}>Job not found</p>
          <p className="text-sm mt-2" style={{ color: "#6b7280" }}>Check your Job ID and try again</p>
        </div>
      </div>
    )
  }

  const status = statusInfo[job.status] || statusInfo.pending

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8f9fa" }}>
      {/* Header */}
      <div className="text-center py-6 px-6" style={{ backgroundColor: "#fff", borderBottom: "1px solid #e5e7eb" }}>
        <span className="text-2xl">🖨️</span>
        <h1 className="text-xl font-bold mt-1" style={{ color: "#1a1a2e" }}>Page<span style={{ color: "#c0392b" }}>Print</span></h1>
      </div>

      <div className="max-w-md mx-auto px-6 py-10">
        {/* Status Card */}
        <div className="p-8 rounded-2xl text-center" style={{ background: "linear-gradient(135deg, #fff 0%, #fef2f0 100%)", border: "1px solid rgba(192,57,43,0.15)", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
          <p className="text-5xl mb-4">{status.icon}</p>
          <h2 className="text-2xl font-bold" style={{ color: "#1a1a2e" }}>
            {status.label}
          </h2>
          <p className="text-sm mt-2" style={{ color: "#6b7280" }}>
            {status.desc}
          </p>

          {/* Status Badge */}
          <div className="mt-6">
            <span
              className="px-4 py-2 rounded-full text-sm font-medium"
              style={{ backgroundColor: status.bg, color: status.color }}
            >
              {status.icon} {status.label}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mt-8">
            <div className="flex justify-between text-xs mb-2" style={{ color: "#6b7280" }}>
              <span>Pending</span>
              <span>Ready</span>
              <span>Done</span>
            </div>
            <div className="w-full h-2 rounded-full" style={{ backgroundColor: "#e5e7eb" }}>
              <div
                className="h-2 rounded-full transition-all"
                style={{
                  backgroundColor: "#c0392b",
                  width: job.status === "pending" ? "33%" : job.status === "ready" ? "66%" : "100%",
                }}
              ></div>
            </div>
          </div>

          {/* Job Details */}
          <div className="mt-8 text-left p-4 rounded-xl" style={{ backgroundColor: "#f8f9fa", border: "1px solid #e5e7eb" }}>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span style={{ color: "#6b7280" }}>Job ID</span>
                <span className="font-medium" style={{ color: "#1a1a2e" }}>{job.jobId}</span>
              </div>
              {job.price > 0 && (
                <div className="flex justify-between">
                  <span style={{ color: "#6b7280" }}>Price</span>
                  <span className="font-medium" style={{ color: "#c0392b" }}>₹{job.price}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span style={{ color: "#6b7280" }}>Payment</span>
                <span className="font-medium" style={{ color: job.isPaid ? "#10b981" : "#f59e0b" }}>
                  {job.isPaid ? "✅ Paid" : "⏳ Pending"}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "#6b7280" }}>Submitted</span>
                <span className="font-medium" style={{ color: "#1a1a2e" }}>
                  {new Date(job.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Refresh */}
        <button
          onClick={fetchStatus}
          className="w-full mt-6 py-3 rounded-xl font-medium transition hover:shadow-lg hover:scale-[1.02] active:scale-95 cursor-pointer"
          style={{ backgroundColor: "#c0392b", color: "#fff" }}
        >
          🔄 Refresh Status
        </button>

        {/* Customer collected button - only when ready */}
        {job && job.status === "ready" && (
          <button
            onClick={async () => {
              const toastId = toast.loading("Confirming collection...")
              try {
                const res = await API.put(`/customer/collected/${jobId}`)
                if (res.data.success) {
                  toast.success("✅ Collected! Files deleted for your privacy.", { id: toastId })
                  fetchStatus()
                }
              } catch (err) {
                toast.error("Failed. Try again.", { id: toastId })
              }
            }}
            className="w-full mt-3 py-3 rounded-xl font-medium transition hover:shadow-lg hover:scale-[1.02] active:scale-95 cursor-pointer"
            style={{ backgroundColor: "#10b981", color: "#fff" }}
          >
            ✅ I Collected My Print
          </button>
        )}

        <p className="text-center text-xs mt-4" style={{ color: "#9ca3af" }}>
          Page auto-refreshes. You can also bookmark this link.
        </p>
      </div>
    </div>
  )
}

export default JobStatus
