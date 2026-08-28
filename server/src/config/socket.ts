import { Server as SocketServer } from "socket.io"
import http from "http"

let io: SocketServer

export const initSocket = (server: http.Server): SocketServer => {
  io = new SocketServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
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
