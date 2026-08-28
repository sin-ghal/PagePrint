import express from "express"
import { auth } from "../middlewares/auth"
import {
  getShopJobs,
  updateJobStatus,
  setJobPrice,
  isPaid,
  getMyQR,
} from "../controllers/shopkeeperJob"

const router = express.Router()

router.get("/my-jobs", auth, getShopJobs)
router.get("/my-qr", auth, getMyQR)
router.put("/update-status/:jobId", auth, updateJobStatus)
router.put("/set-price/:jobId", auth, setJobPrice)
router.put("/mark-paid/:jobId", auth, isPaid)

export default router
