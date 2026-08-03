const mongoose = require("mongoose");

const shopkeeperSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim:true
  },
  shopName: {
    type: String,
    required: true,
    trim:true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim:true
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    trim:true
  },
  shopAddress: {
    type: String,
    required: true,
    trim:true
  },
  shopSlug: {
    type: String,
    unique: true,
    trim:true
  },
  qrCode: {
    type: String,
  },
}, 
{ timestamps: true });

module.exports = mongoose.model("Shopkeeper", shopkeeperSchema);
