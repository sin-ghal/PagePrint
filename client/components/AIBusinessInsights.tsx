"use client"

import { useState, useEffect } from "react"
import toast from "react-hot-toast"
import API from "../services/api"

interface AIInsightData {
  summary: string
  stockAlert?: {
    title: string
    message: string
    urgency?: "high" | "medium" | "low"
  }
  peakHoursAlert?: {
    title: string
    message: string
  }
  revenueTip?: {
    title: string
    message: string
  }
  actionItem?: {
    title: string
    message: string
  }
  metrics?: {
    totalJobs: number
    totalEstimatedSheets: number
    colorPercent: number
    peakDay: string
    peakHoursFormatted: string
    unpaidAmount: number
    totalRevenue: number
    staleReadyCount: number
  }
}

interface Props {
  token: string
}

export default function AIBusinessInsights({ token }: Props) {
  const [insights, setInsights] = useState<AIInsightData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [hasData, setHasData] = useState(true)
  const [isCached, setIsCached] = useState(false)

  const fetchInsights = async (force = false) => {
    if (!token) return
    if (force) setRefreshing(true)
    else setLoading(true)

    try {
      const url = force ? "/shopkeeper/ai-insights?forceRefresh=true" : "/shopkeeper/ai-insights"
      const res = await API.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.data.success) {
        if (res.data.hasData === false) {
          setHasData(false)
        } else {
          setHasData(true)
          setInsights(res.data.insights)
          setIsCached(Boolean(res.data.cached))
          if (force) toast.success("✨ Fresh AI Insights generated!")
        }
      }
    } catch (err: any) {
      if (err?.response?.status !== 401) {
        console.warn("AI Insights fetch failed:", err?.message || err)
      }
      if (force) toast.error("Failed to generate AI insights")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (token) fetchInsights(false)
  }, [token])

  if (loading) {
    return (
      <div className="mb-8 p-6 rounded-2xl bg-white border border-gray-200 shadow-sm animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-48 bg-gray-200 rounded-md"></div>
          <div className="h-8 w-28 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="h-4 w-3/4 bg-gray-100 rounded mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-28 bg-gray-100 rounded-xl"></div>
          <div className="h-28 bg-gray-100 rounded-xl"></div>
          <div className="h-28 bg-gray-100 rounded-xl"></div>
          <div className="h-28 bg-gray-100 rounded-xl"></div>
        </div>
      </div>
    )
  }

  if (!hasData || !insights) {
    return (
      <div
        className="mb-8 p-6 rounded-2xl transition-all"
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, #fdf8f6 40%, #faece8 100%)",
          border: "1.5px dashed rgba(192, 57, 43, 0.4)",
          boxShadow: "0 10px 30px -10px rgba(192, 57, 43, 0.08)",
        }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 mb-3 border-b border-red-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm" style={{ background: "linear-gradient(135deg, #c0392b, #962d22)", color: "#fff" }}>
              ✨
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900 tracking-tight">AI Business Assistant</h2>
                <span className="px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded-full bg-red-100 text-[#c0392b]">
                  Ready & Active
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-0.5">
                Abhi is shop par <strong>0 print jobs</strong> hain. Jaise hi pehla customer order aayega, AI live analytics shuru kar dega!
              </p>
            </div>
          </div>
          <button
            onClick={() => fetchInsights(true)}
            disabled={refreshing}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 shadow-sm hover:shadow active:scale-95 disabled:opacity-60"
            style={{ backgroundColor: "#c0392b", color: "#ffffff" }}
          >
            <span className={refreshing ? "animate-spin" : ""}>🔄</span>
            <span>{refreshing ? "Checking..." : "Check for Jobs"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-700 pt-1">
          <div className="p-3.5 bg-white/90 rounded-xl border border-red-100/80 shadow-xs">
            <span className="font-bold text-gray-900 flex items-center gap-1.5 mb-1.5">
              <span>📦</span> Paper & Toner Stock
            </span>
            <p className="text-gray-600 leading-relaxed">
              Printed sheets count karke batayega ki A4 paper ka ream kab khatam hoga aur kab naya stock mangwana hai.
            </p>
          </div>
          <div className="p-3.5 bg-white/90 rounded-xl border border-red-100/80 shadow-xs">
            <span className="font-bold text-gray-900 flex items-center gap-1.5 mb-1.5">
              <span>⏰</span> Rush Hours Prediction
            </span>
            <p className="text-gray-600 leading-relaxed">
              Aapke pichhle orders se identify karega ki hafte ke kis din aur kis ghante shop par sabse zyada bheed hoti hai.
            </p>
          </div>
          <div className="p-3.5 bg-white/90 rounded-xl border border-red-100/80 shadow-xs">
            <span className="font-bold text-gray-900 flex items-center gap-1.5 mb-1.5">
              <span>💰</span> Revenue & Actions
            </span>
            <p className="text-gray-600 leading-relaxed">
              Color vs B&W printing ki demand aur uncollected ya unpaid jobs ki live alerts dega.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const urgencyStyles = {
    high: "bg-red-50 text-red-700 border-red-200",
    medium: "bg-amber-50 text-amber-700 border-amber-200",
    low: "bg-emerald-50 text-emerald-700 border-emerald-200",
  }

  return (
    <div
      className="mb-8 p-6 rounded-2xl transition-all"
      style={{
        background: "linear-gradient(135deg, #ffffff 0%, #fdf8f6 40%, #faece8 100%)",
        border: "1.5px solid rgba(192, 57, 43, 0.25)",
        boxShadow: "0 10px 30px -10px rgba(192, 57, 43, 0.12)",
      }}
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-red-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm" style={{ background: "linear-gradient(135deg, #c0392b, #962d22)", color: "#fff" }}>
            ✨
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">AI Business Assistant</h2>
              <span className="px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded-full bg-red-100 text-[#c0392b]">
                Gemini Powered
              </span>
              {isCached && (
                <span className="hidden md:inline px-2 py-0.5 text-[11px] font-medium rounded-full bg-gray-100 text-gray-500">
                  ⚡ Cached
                </span>
              )}
            </div>
            <p className="text-xs text-gray-600 mt-0.5">{insights.summary}</p>
          </div>
        </div>

        <button
          onClick={() => fetchInsights(true)}
          disabled={refreshing}
          className="self-end sm:self-auto px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 shadow-sm hover:shadow active:scale-95 disabled:opacity-60"
          style={{ backgroundColor: "#c0392b", color: "#ffffff" }}
        >
          <span className={refreshing ? "animate-spin" : ""}>🔄</span>
          <span>{refreshing ? "Analyzing..." : "Refresh Insights"}</span>
        </button>
      </div>

      {/* Metric Quick Stats Pills */}
      {insights.metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
          <div className="bg-white/80 backdrop-blur p-2.5 rounded-xl border border-red-100/60 text-center">
            <p className="text-xs text-gray-500 font-medium">Est. Paper Printed</p>
            <p className="text-base font-bold text-gray-900">{insights.metrics.totalEstimatedSheets} sheets</p>
          </div>
          <div className="bg-white/80 backdrop-blur p-2.5 rounded-xl border border-red-100/60 text-center">
            <p className="text-xs text-gray-500 font-medium">Color Print Ratio</p>
            <p className="text-base font-bold text-gray-900">{insights.metrics.colorPercent}% Color</p>
          </div>
          <div className="bg-white/80 backdrop-blur p-2.5 rounded-xl border border-red-100/60 text-center">
            <p className="text-xs text-gray-500 font-medium">Busiest Day</p>
            <p className="text-base font-bold text-gray-900">{insights.metrics.peakDay}</p>
          </div>
          <div className="bg-white/80 backdrop-blur p-2.5 rounded-xl border border-red-100/60 text-center">
            <p className="text-xs text-gray-500 font-medium">Pending Payments</p>
            <p className="text-base font-bold" style={{ color: insights.metrics.unpaidAmount > 0 ? "#dc2626" : "#16a34a" }}>
              ₹{insights.metrics.unpaidAmount}
            </p>
          </div>
        </div>
      )}

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* 1. Stock Alert */}
        {insights.stockAlert && (
          <div className="bg-white/90 backdrop-blur p-4 rounded-xl border border-red-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                  <span>📦</span> {insights.stockAlert.title}
                </span>
                {insights.stockAlert.urgency && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${urgencyStyles[insights.stockAlert.urgency] || urgencyStyles.medium}`}>
                    {insights.stockAlert.urgency}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-700 leading-relaxed">{insights.stockAlert.message}</p>
            </div>
          </div>
        )}

        {/* 2. Peak Hours */}
        {insights.peakHoursAlert && (
          <div className="bg-white/90 backdrop-blur p-4 rounded-xl border border-red-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                  <span>⏰</span> {insights.peakHoursAlert.title}
                </span>
                {insights.metrics?.peakHoursFormatted && (
                  <span className="text-[11px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                    {insights.metrics.peakHoursFormatted}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-700 leading-relaxed">{insights.peakHoursAlert.message}</p>
            </div>
          </div>
        )}

        {/* 3. Revenue Tip */}
        {insights.revenueTip && (
          <div className="bg-white/90 backdrop-blur p-4 rounded-xl border border-red-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                  <span>💰</span> {insights.revenueTip.title}
                </span>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed">{insights.revenueTip.message}</p>
            </div>
          </div>
        )}

        {/* 4. Action Item */}
        {insights.actionItem && (
          <div className="bg-white/90 backdrop-blur p-4 rounded-xl border border-red-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                  <span>⚡</span> {insights.actionItem.title}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                  Action
                </span>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed">{insights.actionItem.message}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

