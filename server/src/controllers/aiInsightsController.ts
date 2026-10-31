import { Response } from "express"
import { Types } from "mongoose"
import TotalJobs from "../models/totalJobs"
import Shopkeeper from "../models/Shopkeeper"
import { AuthRequest } from "../middlewares/auth"
import { GoogleGenerativeAI } from "@google/generative-ai"

interface CacheEntry {
  data: any
  expiresAt: number
}

// In-memory cache: 6 hours TTL per shopkeeper
const insightsCache = new Map<string, CacheEntry>()
const CACHE_TTL_MS = 6 * 60 * 60 * 1000

export const getShopAIInsights = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const shopkeeperId = req.user!.id
    const forceRefresh = req.query.forceRefresh === "true"

    // Check in-memory cache if not forced
    const cached = insightsCache.get(shopkeeperId)
    if (!forceRefresh && cached && cached.expiresAt > Date.now()) {
      return res.status(200).json({
        success: true,
        cached: true,
        insights: cached.data,
      })
    }

    const shop = await Shopkeeper.findById(shopkeeperId).select("shopName").lean()
    const shopName = shop?.shopName || "Aapki Print Shop"

    // Fetch up to the last 150 jobs for this shop
    const jobs = await TotalJobs.find({ shopkeeper: new Types.ObjectId(shopkeeperId) })
      .sort({ createdAt: -1 })
      .limit(150)
      .lean()

    if (!jobs || jobs.length === 0) {
      return res.status(200).json({
        success: true,
        hasData: false,
        message: "Abhi tak koi print jobs nahi mile. Jab customer orders aayenge, tab AI yahan insights generate karega!",
        insights: null,
      })
    }

    // --- Aggregation & Statistical Math ---
    const totalJobs = jobs.length
    let totalRevenue = 0
    let unpaidAmount = 0
    let pendingJobs = 0
    let readyJobs = 0
    let completedJobs = 0
    let staleReadyCount = 0 // ready for > 24 hours
    let totalEstimatedSheets = 0

    const colorCounts = { bw: 0, color: 0 }
    const paperSizeCounts: Record<string, number> = { A4: 0, A3: 0, Legal: 0 }
    const dayCounts: Record<string, number> = {
      Sunday: 0, Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0
    }
    const hourCounts: Record<number, number> = {}

    const now = Date.now()
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

    for (const job of jobs) {
      if (job.isPaid) totalRevenue += job.price || 0
      if (!job.isPaid && (job.price || 0) > 0) unpaidAmount += job.price

      if (job.status === "pending") pendingJobs++
      else if (job.status === "ready") {
        readyJobs++
        const ageHours = (now - new Date(job.createdAt).getTime()) / (1000 * 60 * 60)
        if (ageHours > 24) staleReadyCount++
      } else if (job.status === "completed") {
        completedJobs++
      }

      const jobDate = new Date(job.createdAt)
      const dayName = dayNames[jobDate.getDay()]
      dayCounts[dayName] = (dayCounts[dayName] || 0) + 1

      const hour = jobDate.getHours()
      hourCounts[hour] = (hourCounts[hour] || 0) + 1

      if (Array.isArray(job.files)) {
        for (const file of job.files) {
          const copies = Number(file.copies) || 1
          let pageCount = 1
          if (file.pages && file.pages !== "all") {
            const ranges = file.pages.split(",").map((s: string) => s.trim())
            let count = 0
            for (const r of ranges) {
              if (r.includes("-")) {
                const [start, end] = r.split("-").map(Number)
                if (!isNaN(start) && !isNaN(end) && end >= start) count += (end - start + 1)
                else count += 1
              } else if (!isNaN(Number(r))) {
                count += 1
              }
            }
            if (count > 0) pageCount = count
          }
          const sheets = copies * pageCount
          totalEstimatedSheets += sheets

          if (file.colorMode === "color") colorCounts.color += sheets
          else colorCounts.bw += sheets

          const size = file.paperSize || "A4"
          paperSizeCounts[size] = (paperSizeCounts[size] || 0) + sheets
        }
      }
    }

    // Determine Peak Day
    let peakDay = "Monday"
    let maxDayJobs = -1
    for (const [day, count] of Object.entries(dayCounts)) {
      if (count > maxDayJobs) {
        maxDayJobs = count
        peakDay = day
      }
    }

    // Determine Peak Hours Range
    let peakHour = 14
    let maxHourJobs = -1
    for (const [hStr, count] of Object.entries(hourCounts)) {
      const h = Number(hStr)
      if (count > maxHourJobs) {
        maxHourJobs = count
        peakHour = h
      }
    }
    const peakHoursFormatted = `${((peakHour % 12) || 12)} ${peakHour >= 12 ? "PM" : "AM"} - ${(((peakHour + 2) % 12) || 12)} ${(peakHour + 2) >= 12 ? "PM" : "AM"}`

    const colorPercent = totalEstimatedSheets > 0
      ? Math.round((colorCounts.color / totalEstimatedSheets) * 100)
      : 0

    // --- AI Generation (with Gemini or Rule-based Fallback) ---
    const apiKey = process.env.GEMINI_API_KEY
    let finalInsights: any = null

    if (apiKey && apiKey !== "your_gemini_api_key") {
      try {
        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({
          model: "gemini-3.8-flash",
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.4,
          },
        })

        const systemPrompt = `You are a business consultant for a xerox and print shop in India using the PagePrint platform.
Analyze the following operational data for "${shopName}" and return a JSON object with practical, actionable business advice in conversational Hinglish (Hindi + English).

OPERATIONAL DATA:
- Total Analyzed Jobs: ${totalJobs}
- Estimated Total Paper Sheets: ${totalEstimatedSheets} (A4: ${paperSizeCounts.A4 || 0}, A3: ${paperSizeCounts.A3 || 0}, Legal: ${paperSizeCounts.Legal || 0})
- Color vs B&W Ratio: ${colorPercent}% Color (${colorCounts.color} sheets), ${100 - colorPercent}% B&W (${colorCounts.bw} sheets)
- Peak Rush Day: ${peakDay} (${maxDayJobs} jobs)
- Peak Hours: ${peakHoursFormatted}
- Current Job Status: Pending: ${pendingJobs}, Ready: ${readyJobs}, Completed: ${completedJobs}
- Uncollected Ready Jobs (> 24 hours): ${staleReadyCount}
- Unpaid Amount Pending: ₹${unpaidAmount}
- Total Collected Revenue: ₹${totalRevenue}

OUTPUT SCHEMA (Must return valid JSON matching this exact structure):
{
  "summary": "Short 1-2 sentence overview of recent activity",
  "stockAlert": {
    "title": "Paper & Toner Stock",
    "message": "Actionable advice on A4 reams, color ink or toner inventory based on volume",
    "urgency": "high" | "medium" | "low"
  },
  "peakHoursAlert": {
    "title": "Peak Hours & Rush Days",
    "message": "Specific tip on when most customers visit and how to handle the rush"
  },
  "revenueTip": {
    "title": "Pricing & Revenue Tip",
    "message": "Observation regarding color printing demand, pricing, or unpaid order recovery"
  },
  "actionItem": {
    "title": "Immediate Action",
    "message": "Concrete task for today (e.g. follow-up on uncollected jobs or prepare stock)"
  }
}`

        const response = await model.generateContent(systemPrompt)
        const text = response.response.text()
        finalInsights = JSON.parse(text)
      } catch (aiErr: any) {
        console.warn("Gemini API call failed, falling back to smart rule-based insights:", aiErr.message)
      }
    }

    // Rule-based fallback if Gemini API is not configured or failed
    if (!finalInsights) {
      finalInsights = {
        summary: `Pichhle dino me aapke shop par total ${totalJobs} print orders aaye, jisme se lagbhag ${totalEstimatedSheets} sheets print hui hain.`,
        stockAlert: {
          title: "Paper & Toner Stock Alert",
          message: totalEstimatedSheets > 500
            ? `High volume! Lagbhag ${totalEstimatedSheets} sheets use ho chuki hain. Stock check karein aur kam se kam 2 extra A4 reams mangwa lein.`
            : `Aapne ab tak ~${totalEstimatedSheets} sheets print ki hain. Current stock agle 3-4 dino ke liye paryapt hai.`,
          urgency: totalEstimatedSheets > 500 ? "high" : "medium",
        },
        peakHoursAlert: {
          title: "Peak Rush Hours & Day",
          message: `${peakDay} ko sabse zyada orders aate hain (${maxDayJobs} jobs). Raush ka samay lagbhag ${peakHoursFormatted} ke aas paas rehta hai.`,
        },
        revenueTip: {
          title: "Revenue & Color Demand",
          message: colorPercent > 15
            ? `${colorPercent}% printing color me hui hai. Color print ka margin zyada hota hai, color ink cartridge ka level check rakhein.`
            : `Zyadatar (${100 - colorPercent}%) jobs Black & White hain. Bulk B&W printing ke liye duplex (double-side) promote karein taaki paper bache.`,
        },
        actionItem: {
          title: "Immediate Action",
          message: staleReadyCount > 0
            ? `${staleReadyCount} ready print jobs 24 ghante se uncollected hain. Customer ko WhatsApp/call se notify karein.`
            : (unpaidAmount > 0
                ? `Total ₹${unpaidAmount} ki payment pending hai. Collection ke time 'Mark Paid' karna na bhoolein.`
                : `Sabhi ready jobs cleared hain. Naye customer print orders aane ke liye ready rahein!`),
        },
      }
    }

    // Attach raw metric badges for the UI
    finalInsights.metrics = {
      totalJobs,
      totalEstimatedSheets,
      colorPercent,
      peakDay,
      peakHoursFormatted,
      unpaidAmount,
      totalRevenue,
      staleReadyCount,
    }

    // Cache the result
    insightsCache.set(shopkeeperId, {
      data: finalInsights,
      expiresAt: Date.now() + CACHE_TTL_MS,
    })

    return res.status(200).json({
      success: true,
      cached: false,
      hasData: true,
      insights: finalInsights,
    })
  } catch (error: any) {
    console.error("AI Insights Error:", error)
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate AI insights",
    })
  }
}

