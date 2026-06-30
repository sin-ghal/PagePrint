const mongoose = require("mongoose");

const printJobSchema = new mongoose.Schema(
  {
    shopkeeper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shopkeeper",
      required: true,
    },
    jobId: {
      type: String,
      unique: true,
      required: true,
    },
    files: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
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
    paymentId: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "ready", "completed", "cancelled"],
      default: "pending",
    },

  },
  { timestamps: true }
);

module.exports = mongoose.model("PrintJob", printJobSchema);
