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
          await cloudinary.uploader.destroy("printshop-files/" + file.publicId)
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
        await cloudinary.uploader.destroy("printshop-files/" + file.publicId)
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
