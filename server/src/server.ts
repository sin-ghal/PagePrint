import dotenv from "dotenv"
dotenv.config()

import express from "express"
import http from "http"
import cookieParser from "cookie-parser"
import cors from "cors"

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

const server = http.createServer(app)
initSocket(server)

app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/customer", customerRoutes)
app.use("/api/v1/shopkeeper", shopkeeperRoutes)

dbconnect()
cloudinaryConnect()

const PORT = process.env.PORT || 4000
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
