import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()

export const dbconnect = async (): Promise<void> => {
  try {
    const dburl = process.env.MONGODBURL as string
    await mongoose.connect(dburl)
    console.log("Database connected successfully")
  } catch (e: any) {
    console.error("Error in connecting database:", e.message)
    process.exit(1)
  }
}
