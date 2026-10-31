import { Server as SocketServer } from "socket.io"
import http from "http"

let io: SocketServer

export const initSocket = (server: http.Server): SocketServer => {
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

  io = new SocketServer(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true)
        const cleanOrigin = origin.trim().replace(/\/+$/, "")
        if (
          allowedOrigins.includes(cleanOrigin) ||
          cleanOrigin.endsWith(".vercel.app") ||
          cleanOrigin.startsWith("http://localhost:")
        ) {
          callback(null, true)
        } else {
          callback(null, true)
        }
      },
      credentials: true,
    },
  })

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id)

    socket.on("join-shop", (shopkeeperId: string) => {
      socket.join(shopkeeperId)
      console.log(`Shopkeeper ${shopkeeperId} joined room`)
    })

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id)
    })
  })

  return io
}

export const getIO = (): SocketServer => {
  if (!io) throw new Error("Socket.io not initialized")
  return io
}
