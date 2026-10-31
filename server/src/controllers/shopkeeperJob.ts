import { Response } from "express"
import TotalJobs from "../models/totalJobs"
import Shopkeeper from "../models/Shopkeeper"
import { v2 as cloudinary } from "cloudinary"
import { AuthRequest } from "../middlewares/auth"

export const getMyQR = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const shop = await Shopkeeper.findById(req.user!.id)

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      })
    }

    return res.status(200).json({
      success: true,
      qrCode: shop.qrCode,
      shopSlug: shop.shopSlug,
      shopName: shop.shopName,
    })
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

export const getShopJobs = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const shopkeeperId = req.user!.id
    const jobs = await TotalJobs.find({ shopkeeper: shopkeeperId })
      .sort({ createdAt: -1 })
      .lean()

    return res.status(200).json({
      success: true,
      jobs,
    })
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

export const viewFile = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { jobId, fileIndex } = req.params
    const shopkeeperId = req.user!.id

    const job: any = await TotalJobs.findOne({ jobId, shopkeeper: shopkeeperId }).lean()
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" })
    }

    const rawFileIndex = req.params.fileIndex
    const idx = parseInt(Array.isArray(rawFileIndex) ? rawFileIndex[0] : (rawFileIndex || "0"), 10)
    const file = job.files?.[idx]
    if (!file) {
      return res.status(404).json({ success: false, message: "File not found" })
    }

    const isDownload = req.query.download === "true"
    const ext = file.name?.split(".").pop()?.toLowerCase() || "pdf"

    if (file.publicId) {
      const privateUrl = cloudinary.utils.private_download_url(file.publicId, ext, {
        resource_type: file.resourceType || "raw",
        type: "upload",
      })

      const cldRes = await fetch(privateUrl)
      if (cldRes.ok) {
        const mimeMap: Record<string, string> = {
          pdf: "application/pdf",
          png: "image/png",
          jpg: "image/jpeg",
          jpeg: "image/jpeg",
          txt: "text/plain",
          csv: "text/csv",
        }
        const contentType = mimeMap[ext] || "application/octet-stream"

        res.setHeader("Content-Type", contentType)
        res.setHeader(
          "Content-Disposition",
          `${isDownload ? "attachment" : "inline"}; filename="${encodeURIComponent(file.name)}"`
        )

        const arrayBuffer = await cldRes.arrayBuffer()
        return res.send(Buffer.from(arrayBuffer))
      }
    }

    // Fallback redirect
    return res.redirect(file.url)
  } catch (error: any) {
    console.error("viewFile error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

export const updateJobStatus = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { jobId } = req.params
    const { status } = req.body
    const shopkeeperId = req.user!.id

    const job = await TotalJobs.findOneAndUpdate(
      { jobId, shopkeeper: shopkeeperId },
      { status },
      { new: true }
    )

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      })
    }

    if (status === "completed") {
      for (const file of job.files) {
        if (file.publicId) {
          await cloudinary.uploader.destroy(file.publicId, {
            resource_type: file.resourceType || "raw",
          })
        }
      }

      const updatedFiles = job.files.map((f: any) => ({ ...f.toObject(), url: "" }))
      await TotalJobs.findOneAndUpdate({ jobId }, { files: updatedFiles })
      console.log(`Files deleted from cloud for job ${jobId}, metadata preserved`)
    }

    return res.status(200).json({
      success: true,
      message: "Status updated",
      job,
    })
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

export const setJobPrice = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { jobId } = req.params
    const { price } = req.body
    const shopkeeperId = req.user!.id

    const job = await TotalJobs.findOneAndUpdate(
      { jobId, shopkeeper: shopkeeperId },
      { price },
      { new: true }
    )

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      })
    }

    return res.status(200).json({
      success: true,
      message: "Price set",
      job,
    })
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

export const isPaid = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { jobId } = req.params
    const shopkeeperId = req.user!.id

    const job = await TotalJobs.findOneAndUpdate(
      { jobId, shopkeeper: shopkeeperId },
      { isPaid: true },
      { new: true }
    )

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      })
    }

    for (const file of job.files) {
      if (file.publicId) {
        await cloudinary.uploader.destroy(file.publicId, {
          resource_type: file.resourceType || "raw",
        })
      }
    }
    const updatedFiles = job.files.map((f: any) => ({ ...f.toObject(), url: "" }))
    await TotalJobs.findOneAndUpdate({ jobId }, { files: updatedFiles, status: "completed" })

    return res.status(200).json({
      success: true,
      message: "Marked as paid, files deleted",
      job,
    })
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
