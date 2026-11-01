import TotalJobs from "../models/totalJobs"
import { cleanupJobFiles } from "./cleanupJob"


export const AUTO_DELETE_MINUTES = Number(process.env.AUTO_DELETE_MINUTES) || 15


const SWEEP_INTERVAL_MS = 60 * 1000 // every 1 minute

let sweeping = false

const sweepExpiredJobs = async (): Promise<void> => {
  if (sweeping) return // avoid overlapping runs
  sweeping = true
  try {
    const cutoff = new Date(Date.now() - AUTO_DELETE_MINUTES * 60 * 1000)

  
    const expiredJobs = await TotalJobs.find({
      createdAt: { $lte: cutoff },
      "files.url": { $nin: ["", null] },
    }).select("jobId")

    for (const job of expiredJobs) {
      const ok = await cleanupJobFiles(job.jobId)
      if (ok) {
        console.log(
          `Auto-deleted files for job ${job.jobId} (older than ${AUTO_DELETE_MINUTES} min)`
        )
      }
    }
  } catch (err: any) {
    console.log("Auto-cleanup sweep error:", err?.message || err)
  } finally {
    sweeping = false
  }
}


export const startAutoCleanup = (): void => {
 
  setTimeout(() => {
    void sweepExpiredJobs()
  }, 5 * 1000)

  const timer = setInterval(() => {
    void sweepExpiredJobs()
  }, SWEEP_INTERVAL_MS)

  
  if (typeof timer.unref === "function") timer.unref()

  console.log(
    `Auto-cleanup started: files deleted ${AUTO_DELETE_MINUTES} min after upload (sweep every ${SWEEP_INTERVAL_MS / 1000}s)`
  )
}
