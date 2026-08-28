import { Request, Response } from "express"
import User from "../models/Shopkeeper"
import OTP from "../models/otp"
import otpGenerator from "otp-generator"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { generateQR } from "../utils/generateQR"

import dotenv from "dotenv"
dotenv.config()

export const generateOtp = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address",
      })
    }

    // Rate limit: 1 OTP per minute per email
    const recentOtp = await OTP.findOne({ email }).sort({ createdAt: -1 })
    if (recentOtp && Date.now() - recentOtp.createdAt.getTime() < 60 * 1000) {
      return res.status(429).json({
        success: false,
        message: "Wait 1 minute",
      })
    }

    // Generate OTP
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    })

    await OTP.create({ email, otp })

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    })
  } catch (e: any) {
    return res.status(500).json({
      message: e.message,
      success: false,
    })
  }
}

export const signup = async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      name,
      shopName,
      email,
      password,
      confirmPassword,
      phone,
      shopAddress,
      otp,
    } = req.body

    if (
      !name ||
      !shopName ||
      !email ||
      !password ||
      !confirmPassword ||
      !phone ||
      !shopAddress ||
      !otp
    ) {
      return res.status(403).json({
        success: false,
        message: "All Fields are required",
      })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address",
      })
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and Confirm Password do not match. Please try again.",
      })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists. Please sign in to continue.",
      })
    }

    // Verify OTP from MongoDB
    const recentOtp = await OTP.findOne({ email }).sort({ createdAt: -1 })
    if (!recentOtp) {
      return res.status(400).json({
        success: false,
        message: "OTP not found",
      })
    }

    if (otp !== recentOtp.otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      })
    }

    // Delete OTP after verification
    await OTP.deleteMany({ email })

    const hashedPass = await bcrypt.hash(password, 10)

    const shopSlug = shopName.toLowerCase().replaceAll(" ", "-") + "-" + Date.now()

    const qrCode = await generateQR(shopSlug)

    const user = await User.create({
      name,
      shopName: shopName.toUpperCase(),
      email,
      password: hashedPass,
      phone,
      shopAddress,
      shopSlug,
      qrCode,
    })

    return res.status(200).json({
      success: true,
      message: "User registered successfully",
      user,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "User cannot be registered. Please try again.",
    })
  }
}

export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All Fields are required",
      })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address",
      })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    if (await bcrypt.compare(password, user.password)) {
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET as string,
        { expiresIn: "3d" }
      )
      user.password = undefined as any

      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      }

      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: "User Login Success",
      })
    } else {
      return res.status(401).json({
        success: false,
        message: "Password is incorrect",
      })
    }
  } catch (error: any) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

export const resetPassword = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, otp, newPassword } = req.body

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this email",
      })
    }

    // Verify OTP
    const recentOtp = await OTP.findOne({ email }).sort({ createdAt: -1 })
    if (!recentOtp) {
      return res.status(400).json({
        success: false,
        message: "OTP not found. Request a new one.",
      })
    }

    if (otp !== recentOtp.otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await User.findByIdAndUpdate(user._id, { password: hashedPassword })

    // Delete OTP
    await OTP.deleteMany({ email })

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    })
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
