import dotenv from "dotenv"
dotenv.config()

import express, { Request, Response, NextFunction } from "express"
import http from "http"
import cookieParser from "cookie-parser"
import cors from "cors"
import rateLimit from "express-rate-limit"
import multer from "multer"

import { dbconnect } from "./config/database"
import { cloudinaryConnect } from "./config/cloudinary"
import { initSocket } from "./config/socket"
import { startAutoCleanup } from "./utils/autoCleanup"

import authRoutes from "./routes/authRoutes"
import customerRoutes from "./routes/customerRoutes"
import shopkeeperRoutes from "./routes/shopkeeperRoutes"

const app = express()

app.set("trust proxy", 1)

app.use(express.json())
app.use(cookieParser())

// Supported origins
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://page-print.vercel.app",
]

if (process.env.FRONTEND_URL) {
  const envUrl = process.env.FRONTEND_URL.trim().replace(/\/+$/, "")
  if (envUrl && !allowedOrigins.includes(envUrl)) {
    allowedOrigins.push(envUrl)
  }
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true)
      const cleanOrigin = origin.trim().replace(/\/+$/, "")
      if (
        allowedOrigins.includes(cleanOrigin) ||
        cleanOrigin.endsWith(".vercel.app") ||
        cleanOrigin.startsWith("http://localhost:")
      ) {
        callback(null, true)
      } else {
        // Allow request anyway to prevent blocking client
        callback(null, true)
      }
    },
    credentials: true,
  })
)

// Auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many attempts, please try again after 15 minutes." },
})

// Customer upload
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { success: false, message: "Too many upload requests, please slow down." },
})

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,                  
  message: { success: false, message: "Too many requests, please try again later." },
})

const server = http.createServer(app)
initSocket(server)

app.use("/api/v1/auth", authLimiter, authRoutes)
app.use("/api/v1/customer", uploadLimiter, customerRoutes)
app.use("/api/v1/shopkeeper", generalLimiter, shopkeeperRoutes)

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Global API Error:", err)
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ success: false, message: "File exceeds 10MB limit." })
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({ success: false, message: "Maximum 5 files allowed." })
    }
    return res.status(400).json({ success: false, message: `Upload error: ${err.message}` })
  }
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || "An unexpected error occurred.",
  })
})

dbconnect()
cloudinaryConnect()
startAutoCleanup()

const PORT = process.env.PORT || 4000
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
