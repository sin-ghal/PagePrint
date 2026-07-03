const PrintJob = require("../models/printJob")
const Shopkeeper = require("../models/Shopkeeper")
const cloudinary = require("cloudinary").v2
const { v4: uuidv4 } = require("uuid")
const { getIO } = require("../config/socket") //socket

// Customer creates a print job
exports.createJob = async (req, res) => {
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

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please upload at least one file",
      })
    }

const files = req.files.map((file, index) => ({
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

    const jobId = "JOB-" + uuidv4().slice(0, 6).toUpperCase()

  const job = await PrintJob.create({
  shopkeeper: shopkeeper._id,
  jobId,
  files,
  remarks,
})

//socket - emit new job to shopkeeper's room
const io = getIO() //socket
io.to(shopkeeper._id.toString()).emit("new-job", { jobId: job.jobId, files: job.files.length }) //socket

    // Auto-delete files after 30 minutes
    setTimeout(async () => {
      try {
        const freshJob = await PrintJob.findOne({ jobId: job.jobId })
        if (freshJob) {
          for (const file of freshJob.files) {
            if (file.publicId) {
              await cloudinary.uploader.destroy("printshop-files/" + file.publicId)
            }
          }
          const updatedFiles = freshJob.files.map(f => ({ ...f.toObject(), url: "" }))
          await PrintJob.findOneAndUpdate({ jobId: job.jobId }, { files: updatedFiles })
          console.log(`Auto-deleted files for job ${job.jobId} after 30 min`)
        }
      } catch (err) {
        console.log("Auto-delete error:", err.message)
      }
    }, 30 * 60 * 1000)

    return res.status(201).json({
      success: true,
      message: "Job created successfully",
      jobId: job.jobId,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "Failed to create job: " + error.message,
    })
  }
}

// Customer checks job status
exports.getJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params
    const job = await PrintJob.findOne({ jobId })

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
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get shop details by slug
exports.getShopDetails = async (req, res) => {
  try {
    const { shopSlug } = req.params
    const shop = await Shopkeeper.findOne({ shopSlug })

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
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Customer marks job as collected (deletes files from cloudinary)
exports.customerCollected = async (req, res) => {
  try {
    const { jobId } = req.params
    const job = await PrintJob.findOne({ jobId })

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" })
    }

    if (job.status !== "ready") {
      return res.status(400).json({ success: false, message: "Job is not ready yet" })
    }

    // Delete files from cloudinary
    for (const file of job.files) {
      if (file.publicId) {
        await cloudinary.uploader.destroy("printshop-files/" + file.publicId)
      }
    }

    const updatedFiles = job.files.map(f => ({ ...f.toObject(), url: "" }))
    await PrintJob.findOneAndUpdate({ jobId }, { files: updatedFiles, status: "completed" })

    return res.status(200).json({ success: true, message: "Job marked as collected" })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}
