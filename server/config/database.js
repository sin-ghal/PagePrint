const mongoose = require("mongoose");

require("dotenv").config();
const dburl = process.env.MONGODBURL

exports.dbconnect = async ()=>{
    try{
        await mongoose.connect(dburl);
        console.log("database connected successfully");

    }catch(e){
        console.error("error in connecting database:", e.message)
        process.exit(1);
    }
}   