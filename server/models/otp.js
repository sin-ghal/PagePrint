const mongoose = require("mongoose");
const {mailSender}=require('../utils/mailSender')

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // 5 min baad auto-delete
  },
});



otpSchema.pre("save", async function () {
    try {
        await mailSender(
            this.email,
            "Verification Email From PagePrint",
            `<h2>Your OTP is ${this.otp}</h2>`
        )
    } catch (error) {
        console.log("Error occurred while sending email", error)
    }
})

module.exports = mongoose.model("OTP", otpSchema);
