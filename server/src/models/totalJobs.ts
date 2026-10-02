import mongoose, { Document, Schema, Types } from "mongoose"

export interface IFile {
  name: string
  url: string
  publicId?: string
  resourceType?: string
  size?: number
  copies: number
  colorMode: "bw" | "color"
  paperSize: "A4" | "A3" | "Legal"
  sides: "single" | "duplex"
  pages: string
}

export interface ITotalJobs extends Document {
  jobId: string
  shopkeeper: Types.ObjectId
  files: IFile[]
  remarks?: string
  price: number
  isPaid: boolean
  status: "pending" | "ready" | "completed"
  createdAt: Date
  updatedAt: Date
}

const totalJobsSchema = new Schema<ITotalJobs>(
  {
    jobId: {
      type: String,
      unique: true,
      required: true,
    },
    shopkeeper: {
      type: Schema.Types.ObjectId,
      ref: "Shopkeeper",
      required: true,
    },
    files: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
        publicId: { type: String },
        resourceType: { type: String, default: "raw" },
        size: { type: Number },
        copies: { type: Number, default: 1, min: 1 },
        colorMode: { type: String, enum: ["bw", "color"], default: "bw" },
        paperSize: { type: String, enum: ["A4", "A3", "Legal"], default: "A4" },
        sides: { type: String, enum: ["single", "duplex"], default: "single" },
        pages: { type: String, default: "all" },
      },
    ],
    remarks: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      default: 0,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["pending", "ready", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
)

totalJobsSchema.index({ shopkeeper: 1, createdAt: -1 })

export default mongoose.model<ITotalJobs>("TotalJobs", totalJobsSchema)
