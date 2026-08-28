import express from "express"
import { upload } from "../middlewares/multer"
import { createJob, getJobStatus, getShopDetails } from "../controllers/customerJob"

const router = express.Router()

router.get("/shop/:shopSlug", getShopDetails)
router.post("/create/:shopSlug", upload.array("files", 5), createJob)
router.get("/status/:jobId", getJobStatus)

export default router
