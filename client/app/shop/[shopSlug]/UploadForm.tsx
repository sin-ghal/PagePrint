"use client"

import { useState, ChangeEvent, FormEvent } from "react"
import toast from "react-hot-toast"
import API from "../../../services/api"

interface FileOption {
  copies: number
  colorMode: string
  paperSize: string
  sides: string
  pages: string
}

interface Shop {
  shopName: string
  shopAddress: string
  phone?: string
  ownerName?: string
}

export default function UploadForm({ shopSlug, shop }: { shopSlug: string; shop: Shop }) {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [jobId, setJobId] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [remarks, setRemarks] = useState("")
  const [fileOptions, setFileOptions] = useState<FileOption[]>([])

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || [])
    setFiles(selected)
    setFileOptions(selected.map(() => ({ copies: 1, colorMode: "bw", paperSize: "A4", sides: "single", pages: "all" })))
  }

  const updateOption = (index: number, key: keyof FileOption, value: string | number) => {
    const updated = [...fileOptions]
    updated[index] = { ...updated[index], [key]: value }
    setFileOptions(updated)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (files.length === 0) return toast.error("Please select at least one file")
    setSubmitting(true)
    try {
      const formData = new FormData()
      files.forEach((file) => formData.append("files", file))
      formData.append("remarks", remarks)
      fileOptions.forEach((opt, i) => {
        formData.append(`copies[${i}]`, String(opt.copies))
        formData.append(`colorMode[${i}]`, opt.colorMode)
        formData.append(`paperSize[${i}]`, opt.paperSize)
        formData.append(`sides[${i}]`, opt.sides)
        formData.append(`pages[${i}]`, opt.pages)
      })
      const res = await API.post(`/customer/create/${shopSlug}`, formData, { headers: { "Content-Type": "multipart/form-data" } })
      if (res.data.success) { setJobId(res.data.jobId); setSubmitted(true); toast.success("Files sent to shop!") }
    } catch (err: any) { toast.error(err.response?.data?.message || "Failed to send files") }
    setSubmitting(false)
  }

  if (submitted) return (<div className="min-h-[60vh] flex items-center justify-center"><div className="text-center p-8 rounded-2xl max-w-md" style={{ backgroundColor: "#fff", border: "1px solid #e5e7eb" }}><p className="text-5xl mb-4">✅</p><h2 className="text-2xl font-bold" style={{ color: "#1a1a2e" }}>Files Sent!</h2><p className="mt-2" style={{ color: "#6b7280" }}>Your files have been sent to {shop.shopName}</p><div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: "#fdecea" }}><p className="text-sm font-medium" style={{ color: "#c0392b" }}>Job ID: {jobId}</p></div><p className="text-xs mt-4" style={{ color: "#9ca3af" }}>Track your job: <a href={`/status/${jobId}`} className="font-medium" style={{ color: "#c0392b", textDecoration: "underline" }}>Click here to track status</a></p></div></div>)

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <form onSubmit={handleSubmit}>
        <div className="text-center mb-4 px-4 py-3 rounded-lg" style={{ backgroundColor: "#d1fae5", border: "1px solid #a7f3d0" }}><p className="text-sm font-medium" style={{ color: "#065f46" }}>🔒 Your files are safe. They are automatically deleted after printing. No personal data is stored.</p></div>
        <div className="text-center mb-4 px-4 py-3 rounded-lg" style={{ backgroundColor: "#dbeafe", border: "1px solid #93c5fd" }}><p className="text-sm font-medium" style={{ color: "#1e40af" }}>🔍 Already submitted a job? <a href="#track-section" style={{ color: "#1e40af", textDecoration: "underline", fontWeight: "700" }}>Track it here ↓</a></p></div>

        <div className="p-6 rounded-xl mb-6 transition cursor-pointer hover:shadow-lg" style={{ backgroundColor: "#fff", border: "2px dashed rgba(192,57,43,0.3)" }} onClick={() => document.getElementById("fileInput")?.click()}>
          <div className="text-center">
            <p className="text-4xl mb-3">📁</p>
            <p className="font-medium" style={{ color: "#1a1a2e" }}>Click here to select files</p>
            <p className="text-xs mt-1" style={{ color: "#6b7280" }}>PDF, Word, Images, PPT (Max 10MB each, up to 5 files)</p>
            <input id="fileInput" type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.txt,.csv" onChange={handleFileChange} className="hidden" />
            {files.length > 0 && <p className="mt-3 text-sm font-medium" style={{ color: "#c0392b" }}>✅ {files.length} file(s) selected</p>}
          </div>
        </div>

        {files.length > 0 && (
          <div className="space-y-4 mb-6">
            <h3 className="font-bold text-lg" style={{ color: "#1a1a2e" }}>Print Options</h3>
            {files.map((file, i) => (
              <div key={i} className="p-5 rounded-xl" style={{ backgroundColor: "#fff", border: "1px solid #e5e7eb" }}>
                <p className="font-semibold mb-3" style={{ color: "#1a1a2e" }}>📄 {file.name}</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div><label className="text-xs font-medium block mb-1" style={{ color: "#374151" }}>Copies</label><input type="number" min="1" value={fileOptions[i]?.copies || 1} onChange={(e) => updateOption(i, "copies", e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm" style={{ border: "1px solid #e5e7eb", outline: "none" }} /></div>
                  <div><label className="text-xs font-medium block mb-1" style={{ color: "#374151" }}>Color</label><select value={fileOptions[i]?.colorMode || "bw"} onChange={(e) => updateOption(i, "colorMode", e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm" style={{ border: "1px solid #e5e7eb", outline: "none" }}><option value="bw">B&W</option><option value="color">Color</option></select></div>
                  <div><label className="text-xs font-medium block mb-1" style={{ color: "#374151" }}>Paper</label><select value={fileOptions[i]?.paperSize || "A4"} onChange={(e) => updateOption(i, "paperSize", e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm" style={{ border: "1px solid #e5e7eb", outline: "none" }}><option value="A4">A4</option><option value="A3">A3</option><option value="Legal">Legal</option></select></div>
                  <div><label className="text-xs font-medium block mb-1" style={{ color: "#374151" }}>Sides</label><select value={fileOptions[i]?.sides || "single"} onChange={(e) => updateOption(i, "sides", e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm" style={{ border: "1px solid #e5e7eb", outline: "none" }}><option value="single">Single Side</option><option value="duplex">Duplex</option></select></div>
                  <div><label className="text-xs font-medium block mb-1" style={{ color: "#374151" }}>Pages</label><input type="text" placeholder="all or 1-5, 8" value={fileOptions[i]?.pages || "all"} onChange={(e) => updateOption(i, "pages", e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm" style={{ border: "1px solid #e5e7eb", outline: "none" }} /></div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mb-6">
          <label className="text-sm font-medium block mb-2" style={{ color: "#374151" }}>Remarks (optional)</label>
          <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="e.g., Urgent, Spiral binding needed..." className="w-full px-4 py-3 rounded-lg text-sm transition" style={{ border: "1px solid #e5e7eb", outline: "none", resize: "none" }} rows={3} />
        </div>

        <button type="submit" disabled={submitting || files.length === 0} className="w-full py-4 rounded-xl font-bold text-lg transition hover:shadow-lg hover:scale-[1.02] active:scale-95 cursor-pointer" style={{ backgroundColor: submitting || files.length === 0 ? "#e57373" : "#c0392b", color: "#fff" }}>
          {submitting ? "Sending..." : "📤 Send to Shop"}
        </button>
      </form>

      <div id="track-section" className="mt-8 p-6 rounded-xl" style={{ backgroundColor: "#fff", border: "1px solid #e5e7eb" }}>
        <h3 className="font-bold text-lg mb-3" style={{ color: "#1a1a2e" }}>🔍 Track Your Job</h3>
        <p className="text-sm mb-3" style={{ color: "#6b7280" }}>Already submitted? Enter your Job ID to check status.</p>
        <div className="flex gap-2">
          <input type="text" placeholder="Enter Job ID (e.g., JOB-0C81F4)" id="trackInput" className="flex-1 px-4 py-3 rounded-lg text-sm transition" style={{ border: "1px solid #e5e7eb", outline: "none" }} />
          <button type="button" onClick={() => { const el = document.getElementById("trackInput") as HTMLInputElement; const id = el?.value.trim(); if (id) window.location.href = `/status/${id}`; else toast.error("Enter a Job ID") }} className="px-5 py-3 rounded-lg font-medium transition hover:shadow-lg hover:scale-105 active:scale-95 cursor-pointer" style={{ backgroundColor: "#c0392b", color: "#fff" }}>Track</button>
        </div>
      </div>
    </div>
  )
}
