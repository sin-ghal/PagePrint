import TotalJobs from "../models/totalJobs"
import { cleanupJobFiles } from "./cleanupJob"

// How long uploaded files are kept before auto-deletion (in minutes).
// Change this single value to adjust the retention window.
export const AUTO_DELETE_MINUTES = Number(process.env.AUTO_DELETE_MINUTES) || 15

// How often the sweeper checks for expired jobs (in milliseconds).
const SWEEP_INTERVAL_MS = 60 * 1000 // every 1 minute

let sweeping = false

/**
 * Finds jobs whose files have outlived the retention window and still have
 * live file URLs, then deletes those files from Cloudinary and clears the URLs.
 *
 * Unlike an in-memory setTimeout, this survives server restarts/redeploys:
 * on startup the sweeper picks up any already-expired jobs and cleans them.
 */
const sweepExpiredJobs = async (): Promise<void> => {
  if (sweeping) return // avoid overlapping runs
  sweeping = true
  try {
    const cutoff = new Date(Date.now() - AUTO_DELETE_MINUTES * 60 * 1000)

    // Jobs created before the cutoff that still have at least one live file URL.
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

/**
 * Starts the periodic background cleanup. Call once after the DB is connected.
 */
export const startAutoCleanup = (): void => {
  // Run once shortly after startup to catch jobs that expired while the
  // server was down, then keep sweeping on an interval.
  setTimeout(() => {
    void sweepExpiredJobs()
  }, 5 * 1000)

  const timer = setInterval(() => {
    void sweepExpiredJobs()
  }, SWEEP_INTERVAL_MS)

  // Don't let the interval keep the process alive on its own.
  if (typeof timer.unref === "function") timer.unref()

  console.log(
    `Auto-cleanup started: files deleted ${AUTO_DELETE_MINUTES} min after upload (sweep every ${SWEEP_INTERVAL_MS / 1000}s)`
  )
}
