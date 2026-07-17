const mongoose = require("mongoose")
const crypto = require("crypto")
require("dotenv").config()

const PrintJob = require("./models/printJob")

const SHOPKEEPER_ID = "6a59cdec8624048bbe9a76a0"

const generateJobs = (count) => {
  const jobs = []
  for (let i = 0; i < count; i++) {
    jobs.push({
      shopkeeper: SHOPKEEPER_ID,
      jobId: "JOB-" + crypto.randomUUID().slice(0, 10).toUpperCase(),
      files: [
        {
          name: "document.pdf",
          url: "https://res.cloudinary.com/demo/image/upload/sample.pdf",
          publicId: "printshop-files/sample123",
          size: 102400,
          copies: 2,
          colorMode: "bw",
          paperSize: "A4",
          sides: "single",
          pages: "all",
        },
      ],
      remarks: "print it fast",
      price: 15,
      isPaid: false,
      status: "pending",
      createdAt: new Date(),
    })
  }
  return jobs
}

const testing = async () => {
  try {
    await mongoose.connect(process.env.MONGODBURL)
    console.log("DB connected")

    const jobs = generateJobs(10000)
    await PrintJob.insertMany(jobs)
    console.log("10000 jobs inserted!")

    process.exit(0)
  } catch (err) {
    console.error("Error:", err.message)
    process.exit(1)
  }
}

testing()
