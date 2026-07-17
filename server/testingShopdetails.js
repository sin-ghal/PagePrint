const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
require("dotenv").config()

const Shopkeeper = require("./models/Shopkeeper")

const generateShopkeepers = async (count) => {
  const hashedPassword = await bcrypt.hash("test", 10)
  const shopkeepers = []

  for (let i = 1; i <= count; i++) {
    shopkeepers.push({
      name: `${i}`,
      shopName: `${i}`,
      email: `shop${i}@test.com`,
      password: hashedPassword,
      phone: `98`,
      shopAddress: `Shop No. ${i}, Main Road, Delhi`,
      shopSlug: `printshop-${i}`,
      qrCode: "",
      isVerified: true,
    })
  }
  return shopkeepers
}

const testingShopdetails = async () => {
  try {
    await mongoose.connect(process.env.MONGODBURL)
    console.log("DB connected")

    await Shopkeeper.deleteMany({ email: { $regex: /^shop\d+@test\.com$/ } })
    console.log("Old test shopkeepers deleted")

    const shopkeepers = await generateShopkeepers(1000)
    await Shopkeeper.insertMany(shopkeepers)
    console.log("1000 shopkeepers inserted!")

    process.exit(0)
  } catch (err) {
    console.error("Error:", err.message)
    process.exit(1)
  }
}

testingShopdetails()
