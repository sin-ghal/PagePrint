const PrintJob = require("../models/printJob")
const cloudinary = require("cloudinary").v2

// Shopkeeper gets all their jobs
exports.getShopJobs = async (req, res) => {
  try {
    const shopkeeperId = req.user.id
    const jobs = await PrintJob.find({ shopkeeper: shopkeeperId }).sort({ createdAt: -1 })

    return res.status(200).json({
      success: true,
      jobs,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Shopkeeper updates job status
exports.updateJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params
    const { status } = req.body
    const shopkeeperId = req.user.id

    const job = await PrintJob.findOneAndUpdate(
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
    if (file.url) {
      const publicId = file.url.split("/").pop().split(".")[0]
      await cloudinary.uploader.destroy("printshop-files/" + publicId)
    }
  }
  // Sirf url hataao, baaki metadata (name, copies, colorMode etc.) rahe
  const updatedFiles = job.files.map(f => ({ ...f.toObject(), url: "" }))
  await PrintJob.findOneAndUpdate({ jobId }, { files: updatedFiles })
  console.log(`Files deleted from cloud for job ${jobId}, metadata preserved`)
}

    //socket - emit status update to job room
    const { getIO } = require("../config/socket") //socket
    const io = getIO() //socket
    io.to(job.jobId).emit("job-status-update", { jobId: job.jobId, status: job.status }) //socket

    return res.status(200).json({
      success: true,
      message: "Status updated",
      job,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Shopkeeper sets price
exports.setJobPrice = async (req, res) => {
  try {
    const { jobId } = req.params
    const { price } = req.body
    const shopkeeperId = req.user.id

    const job = await PrintJob.findOneAndUpdate(
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
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

//payment status
// Shopkeeper marks job as paid
exports.isPaid = async (req, res) => {
  try {
    const { jobId } = req.params
    const shopkeeperId = req.user.id

    const job = await PrintJob.findOneAndUpdate(
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

    // Delete files from cloudinary, keep metadata
    for (const file of job.files) {
      if (file.url) {
        const publicId = file.url.split("/").pop().split(".")[0]
        await cloudinary.uploader.destroy("printshop-files/" + publicId)
      }
    }
    const updatedFiles = job.files.map(f => ({ ...f.toObject(), url: "" }))
    await PrintJob.findOneAndUpdate({ jobId }, { files: updatedFiles, status: "completed" })

    return res.status(200).json({
      success: true,
      message: "Marked as paid, files deleted",
      job,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

//download QR code
exports.getMyQR = async (req, res) => {
  try {
    const Shopkeeper = require("../models/Shopkeeper")
    const shop = await Shopkeeper.findById(req.user.id)

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
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
