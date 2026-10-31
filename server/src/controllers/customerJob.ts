import { Request, Response } from "express"
import TotalJobs, { IFile } from "../models/totalJobs"
import Shopkeeper from "../models/Shopkeeper"
import { v2 as cloudinary } from "cloudinary"
import crypto from "crypto"
import { getIO } from "../config/socket"

export const createJob = async (req: Request, res: Response): Promise<any> => {
  try {
    const rawSlug = req.params.shopSlug
    const cleanSlug = (Array.isArray(rawSlug) ? rawSlug[0] : rawSlug || "").trim()

    const shopkeeper = await Shopkeeper.findOne({
      shopSlug: { $regex: new RegExp(`^${cleanSlug}$`, "i") },
    })
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

    const files: IFile[] = uploadedFiles.map((file: any, index: number) => {
      const rawCopies = Number(req.body[`copies[${index}]`] ?? req.body.copies?.[index])
      const copies = !isNaN(rawCopies) && rawCopies >= 1 ? Math.floor(rawCopies) : 1

      const rawColor = String(req.body[`colorMode[${index}]`] ?? req.body.colorMode?.[index] ?? "bw").toLowerCase()
      const colorMode: "bw" | "color" = rawColor === "color" ? "color" : "bw"

      const rawPaper = String(req.body[`paperSize[${index}]`] ?? req.body.paperSize?.[index] ?? "A4").toUpperCase()
      const paperSize: "A4" | "A3" | "Legal" =
        rawPaper === "A3" ? "A3" : rawPaper === "LEGAL" ? "Legal" : "A4"

      const rawSides = String(req.body[`sides[${index}]`] ?? req.body.sides?.[index] ?? "single").toLowerCase()
      const sides: "single" | "duplex" = rawSides === "duplex" ? "duplex" : "single"

      const pages = String(req.body[`pages[${index}]`] ?? req.body.pages?.[index] ?? "all").trim() || "all"

      return {
        name: file.originalname,
        url: file.path,
        publicId: file.filename,
        resourceType: file.resourceType || "raw",
        size: file.size,
        copies,
        colorMode,
        paperSize,
        sides,
        pages,
      }
    })

    const jobId = "JOB-" + crypto.randomUUID().slice(0, 6).toUpperCase()

    const job: any = await TotalJobs.create({
      shopkeeper: shopkeeper._id,
      jobId,
      files,
      remarks: req.body.remarks,
    })

    try {
      const io = getIO()
      io.to(shopkeeper._id.toString()).emit("new-job", {
        jobId: job.jobId,
        files: job.files.length,
      })
    } catch (sockErr: any) {
      console.warn("Socket notification notice:", sockErr?.message || sockErr)
    }

    setTimeout(async () => {
      try {
        const freshJob: any = await TotalJobs.findOne({ jobId: job.jobId })
        if (freshJob) {
          for (const file of freshJob.files) {
            if (file.publicId) {
              await cloudinary.uploader.destroy(file.publicId, {
                resource_type: file.resourceType || "raw",
              })
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
    console.error("createJob error:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to create job: " + error.message,
    })
  }
}

export const getJobStatus = async (req: Request, res: Response): Promise<any> => {
  try {
    const { jobId } = req.params
    const job: any = await TotalJobs.findOne({ jobId })

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
    const rawSlug = req.params.shopSlug
    const cleanSlug = (Array.isArray(rawSlug) ? rawSlug[0] : rawSlug || "").trim()

    const shop: any = await Shopkeeper.findOne({
      shopSlug: { $regex: new RegExp(`^${cleanSlug}$`, "i") },
    })
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
