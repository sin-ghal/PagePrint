const express = require("express")
const router = express.Router()
const { auth } = require("../middlewares/auth")
const { getShopJobs, updateJobStatus, setJobPrice, isPaid, getMyQR } = require("../controllers/shopkeeperJob")

router.get("/my-jobs", auth, getShopJobs)
router.get("/my-qr", auth, getMyQR)
router.put("/update-status/:jobId", auth, updateJobStatus)
router.put("/set-price/:jobId", auth, setJobPrice)
router.put("/mark-paid/:jobId",auth,isPaid)

module.exports = router
