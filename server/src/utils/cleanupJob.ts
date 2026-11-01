import { v2 as cloudinary } from "cloudinary"
import TotalJobs from "../models/totalJobs"


export const cleanupJobFiles = async (jobId: string): Promise<boolean> => {
  const job: any = await TotalJobs.findOne({ jobId })
  if (!job) return false

  for (const file of job.files) {
    if (file.publicId) {
      try {
        await cloudinary.uploader.destroy(file.publicId, {
          resource_type: file.resourceType || "raw",
        })
      } catch (err: any) {
        console.log(`Cloudinary destroy failed for ${file.publicId}:`, err?.message || err)
      }
    }
  }

  const updatedFiles = job.files.map((f: any) => ({
    ...f.toObject(),
    url: "",
    publicId: "",
  }))

  await TotalJobs.findOneAndUpdate({ jobId }, { files: updatedFiles })
  return true
}
