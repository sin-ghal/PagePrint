const express = require("express")
const router = express.Router()


const {
    generateOtp, 
    signup, 
    login, 
    changePassword
} = require("../controllers/Auth")

const { auth } = require("../middlewares/auth")

router.post("/send-otp", generateOtp)
router.post("/signup", signup)
router.post("/login", login)
router.put("/change-password", auth, changePassword)

module.exports = router
