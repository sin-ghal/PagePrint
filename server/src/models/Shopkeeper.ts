import mongoose, { Document, Schema } from "mongoose"

export interface IShopkeeper extends Document {
  name: string
  shopName: string
  email: string
  password: string
  phone: string
  shopAddress: string
  shopSlug: string
  qrCode: string
}

const shopkeeperSchema = new Schema<IShopkeeper>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    shopName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    shopAddress: {
      type: String,
      required: true,
      trim: true,
    },
    shopSlug: {
      type: String,
      unique: true,
      trim: true,
    },
    qrCode: {
      type: String,
    },
  },
  { timestamps: true }
)

export default mongoose.model<IShopkeeper>("Shopkeeper", shopkeeperSchema)
