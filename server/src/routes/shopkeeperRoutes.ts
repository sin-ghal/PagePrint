import express from "express"
import { auth } from "../middlewares/auth"
import {
  getShopJobs,
  updateJobStatus,
  setJobPrice,
  isPaid,
  getMyQR,
  viewFile,
} from "../controllers/shopkeeperJob"
import { getShopAIInsights } from "../controllers/aiInsightsController"

const router = express.Router()

router.get("/my-jobs", auth, getShopJobs)
router.get("/my-qr", auth, getMyQR)
router.get("/file/:jobId/:fileIndex", auth, viewFile)
router.get("/ai-insights", auth, getShopAIInsights)
router.put("/update-status/:jobId", auth, updateJobStatus)
router.put("/set-price/:jobId", auth, setJobPrice)
router.put("/mark-paid/:jobId", auth, isPaid)

export default router
