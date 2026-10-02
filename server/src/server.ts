import dotenv from "dotenv"
dotenv.config()

import express from "express"
import http from "http"
import cookieParser from "cookie-parser"
import cors from "cors"
import rateLimit from "express-rate-limit"

import { dbconnect } from "./config/database"
import { cloudinaryConnect } from "./config/cloudinary"
import { initSocket } from "./config/socket"

import authRoutes from "./routes/authRoutes"
import customerRoutes from "./routes/customerRoutes"
import shopkeeperRoutes from "./routes/shopkeeperRoutes"

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
)

// Auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many attempts, please try again after 15 minutes." },
})

// Customer upload
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: "Too many upload requests, please slow down." },
})

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,                  
  message: { error: "Too many requests, please try again later." },
})

const server = http.createServer(app)
initSocket(server)

app.use("/api/v1/auth", authLimiter, authRoutes)
app.use("/api/v1/customer", uploadLimiter, customerRoutes)
app.use("/api/v1/shopkeeper", generalLimiter, shopkeeperRoutes)

dbconnect()
cloudinaryConnect()

const PORT = process.env.PORT || 4000
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
