const TotalJobs = require("../models/totalJobs")
const cloudinary = require("cloudinary").v2


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


// Shopkeeper gets all their jobs
exports.getShopJobs = async (req, res) => {
  try {
    const shopkeeperId = req.user.id
    // const jobs = await TotalJobs.find({ shopkeeper: shopkeeperId }).sort({ createdAt: -1 })
    const jobs = await TotalJobs.find({ shopkeeper: shopkeeperId }).sort({ createdAt: -1 }).lean()


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
  
  const updatedFiles = job.files.map(f => ({ ...f.toObject(), url: "" }))
  await TotalJobs.findOneAndUpdate({ jobId }, { files: updatedFiles })
  console.log(`Files deleted from cloud for job ${jobId}, metadata preserved`)
}

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

    // Delete files from cloudinary, keep metadata
    for (const file of job.files) {
      if (file.publicId) {
        await cloudinary.uploader.destroy("printshop-files/" + file.publicId)
      }
    }
    const updatedFiles = job.files.map(f => ({ ...f.toObject(), url: "" }))
    await TotalJobs.findOneAndUpdate({ jobId }, { files: updatedFiles, status: "completed" })

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

