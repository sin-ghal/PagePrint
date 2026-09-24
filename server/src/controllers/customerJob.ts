import { Request, Response } from "express"
import TotalJobs from "../models/totalJobs"
import Shopkeeper from "../models/Shopkeeper"
import { v2 as cloudinary } from "cloudinary"
import crypto from "crypto"
import { getIO } from "../config/socket"

export const createJob = async (req: Request, res: Response): Promise<any> => {
  try {
    const { shopSlug } = req.params
    const { remarks } = req.body

    const shopkeeper = await Shopkeeper.findOne({ shopSlug })
    if (!shopkeeper) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      })
    }

    const uploadedFiles = req.files as Express.Multer.File[]
    if (!uploadedFiles || uploadedFiles.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please upload at least one file",
      })
    }

    const files = uploadedFiles.map((file: any, index: number) => ({
      name: file.originalname,
      url: file.path,
      publicId: file.filename,
      size: file.size,
      copies: req.body.copies?.[index] || 1,
      colorMode: req.body.colorMode?.[index] || "bw",
      paperSize: req.body.paperSize?.[index] || "A4",
      sides: req.body.sides?.[index] || "single",
      pages: req.body.pages?.[index] || "all",
    }))

    const jobId = "JOB-" + crypto.randomUUID().slice(0, 6).toUpperCase()

    const job = await TotalJobs.create({
      shopkeeper: shopkeeper._id,
      jobId,
      files,
      remarks,
    })

    // Socket - emit new job to shopkeeper's room
    const io = getIO()
    io.to(shopkeeper._id.toString()).emit("new-job", {
      jobId: job.jobId,
      files: job.files.length,
    })

    // Auto-delete files after 30 minutes
    setTimeout(async () => {
      try {
        const freshJob = await TotalJobs.findOne({ jobId: job.jobId })
        if (freshJob) {
          for (const file of freshJob.files) {
            if (file.publicId) {
              await cloudinary.uploader.destroy("printshop-files/" + file.publicId)
            }
          }
          const updatedFiles = freshJob.files.map((f: any) => ({
            ...f.toObject(),
            url: "",
          }))
          await TotalJobs.findOneAndUpdate({ jobId: job.jobId }, { files: updatedFiles })
          console.log(`Auto-deleted files for job ${job.jobId} after 15 min`)
        }
      } catch (err: any) {
        console.log("Auto-delete error:", err.message)
      }
    }, 15 * 60 * 1000)

    return res.status(201).json({
      success: true,
      message: "Job created successfully",
      jobId: job.jobId,
    })
  } catch (error: any) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "Failed to create job: " + error.message,
    })
  }
}

export const getJobStatus = async (req: Request, res: Response): Promise<any> => {
  try {
    const { jobId } = req.params
    const job = await TotalJobs.findOne({ jobId })

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      })
    }

    return res.status(200).json({
      success: true,
      job: {
        jobId: job.jobId,
        status: job.status,
        price: job.price,
        isPaid: job.isPaid,
        createdAt: job.createdAt,
      },
    })
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

export const getShopDetails = async (req: Request, res: Response): Promise<any> => {
  try {
    const { shopSlug } = req.params
    const shop = await Shopkeeper.findOne({ shopSlug })
      .select("shopName shopAddress phone name")
      .lean()

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      })
    }

    return res.status(200).json({
      success: true,
      shop: {
        shopName: shop.shopName,
        shopAddress: shop.shopAddress,
        phone: shop.phone,
        ownerName: shop.name,
      },
    })
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
