require("dotenv").config()

const express = require("express")
const app = express()
const http = require("http") //socket

const cookieParser = require("cookie-parser")
const cors = require("cors")

//configs
const {dbconnect} = require("./config/database")
const {cloudinaryConnect}=require("./config/cloudinary")
const { initSocket } = require("./config/socket") //socket

//route files
const authRoutes = require("./routes/authRoutes")
const customerRoutes = require("./routes/customerRoutes")
const shopkeeperRoutes = require("./routes/shopkeeperRoutes")

// Middleware
app.use(express.json())
app.use(cookieParser())
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5000",
  credentials: true,
}))

const server = http.createServer(app) //socket
initSocket(server) //socket

// Routes
app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/customer", customerRoutes)
app.use("/api/v1/shopkeeper", shopkeeperRoutes)

// DB connect
dbconnect()
//cloud connect
cloudinaryConnect();

//server start
const PORT = process.env.PORT || 4000
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
