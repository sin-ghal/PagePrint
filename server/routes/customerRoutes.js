const express = require("express")
const router = express.Router()

const { upload } = require("../middlewares/multer")
const { createJob, getJobStatus, getShopDetails, customerCollected } = require("../controllers/customerJob")

router.post("/create/:shopSlug", upload.array("files", 5), createJob)
router.get("/status/:jobId", getJobStatus)
router.get("/shop/:shopSlug", getShopDetails)
router.put("/collected/:jobId", customerCollected)

module.exports = router
