import mongoose, { Document, Schema } from "mongoose"
import { mailSender } from "../utils/mailSender"

export interface IOTP extends Document {
  email: string
  otp: string
  createdAt: Date
}

const otpSchema = new Schema<IOTP>({
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
    expires: 300, // 5 min auto-delete
  },
})

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

export default mongoose.model<IOTP>("OTP", otpSchema)
