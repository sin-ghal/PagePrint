import express from "express"
import { generateOtp, signup, login, resetPassword } from "../controllers/Auth"

const router = express.Router()

router.post("/send-otp", generateOtp)
router.post("/signup", signup)
router.post("/login", login)
router.post("/reset-password", resetPassword)

export default router
