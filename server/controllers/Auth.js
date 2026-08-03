const User = require("../models/Shopkeeper")
const OTP = require("../models/otp")
const otpGenerator = require("otp-generator")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const {generateQR} = require("../utils/generateQR")

require("dotenv").config()

exports.generateOtp = async (req, res) => {
    try {
        const { email } = req.body

        //email validation
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }
         //email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

if (!emailRegex.test(email)) {
    return res.status(400).json({
        success: false,
        message: "Enter a valid email address",
    })
}

//limit for the user to send one otp in 1 min 
        const recentOtp = await OTP.findOne({ email }).sort({ createdAt: -1 })
        if (recentOtp && (Date.now() - recentOtp.createdAt < 60 * 1000)) {
            return res.status(429).json({
                message: "Wait 1 minute"
            })
        }
//limit for the user to send one otp in 1 min  done


        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false
        })

        const response = await OTP.create({ email, otp })

        res.status(200).json({
            success: true,
            message: "OTP sent successfully",
        })

    } catch (e) {
        return res.status(500).json({
            message: e.message,
            success: false
        })
    }
}

//signup page
exports.signup = async (req, res) => {
    try {
        // Destructure fields from the request body
        const {
            name,
            shopName,
            email,
            password,
            confirmPassword,
            phone,
            shopAddress,
            otp,
        } = req.body
        // Check if All Details are there or not
        if (
            !name || 
            !shopName || 
            !email || 
            !password || 
            !confirmPassword || 
            !phone || 
            !shopAddress || 
            !otp) {

            return res.status(403).send({
                success: false,
                message: "All Fields are required",
            })
        }
        // Check if password and confirm password match
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message:
                    "Password and Confirm Password do not match. Please try again.",
            })
        }
       
        // Check if user already exists
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists. Please sign in to continue.",
            })
        }
        
        const recentOtp = await OTP.findOne({ email }).sort({ createdAt: -1 })
        if (!recentOtp) {
            return res.status(400).json({
                success: false,
                message: "otp not found"
            })
        }

        if (otp !== recentOtp.otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid otp"
            })
        }
        //otp validation done

//delete after verification
const deleteOtp = await OTP.deleteMany({ email })
//deleted after verification

        //hash password
        const hashedPass = await bcrypt.hash(password, 10)
        //hashing done

//create shop slug  
const shopSlug = shopName.toLowerCase().replaceAll(" ", "-") + "-" + Date.now();

//QR code generate
const qrCode = await generateQR(shopSlug)

        const user = await User.create({
            name,
            shopName: shopName.toUpperCase(),
            email,
            password: hashedPass,
            phone,
            shopAddress,
            shopSlug,
            qrCode
        })
        
        return res.status(200).json({
            success: true,
            message: "User registered successfully",
            user,
        });

    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "User cannot be registered. Please try again.",
        })
    }
}

//login
exports.login = async (req,res)=>{
    try{
        const {email,password} = req.body

//data validation        
        if(!email || !password){
             return res.status(400).send({
                success: false,
                message: "All Fields are required",
            })
        }
//data validation done  

//user existence
        const user = await User.findOne({email})
        if(!user){
            return res.status(404).send({
                success: false,
                message: "user not found",
            })
        }
//user existence done

//password match and generate jwt token
if(await bcrypt.compare(password,user.password)){
    const token = jwt.sign(
        {
            email:user.email,
            id:user._id,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "3d"
        }
    )
    // user.token = token 
    user.password = undefined

// Set cookie for token and return success response 
    const options = {
        expires: new Date(Date.now() + 3*24*60*60*1000),
        httpOnly:true,
    }

//password matched and generated jwt token

//token ko browser me bhejna...token is stored in browser
res.cookie("token",token,options).status(200).json({
        success: true,
        token,
        user,
        message: `User Login Success`,
      })
}else {
      return res.status(401).json({
        success: false,
        message: `Password is incorrect`,
      })
    }

    }catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            // message: "User cannot login. Please try again.",
            message:error.message
        })
    }
}

//forgot password - reset with OTP
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      })
    }

    // Check user exists
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this email",
      })
    }

    // Verify OTP
    const recentOtp = await OTP.findOne({ email }).sort({ createdAt: -1 })
    if (!recentOtp) {
      return res.status(400).json({
        success: false,
        message: "OTP not found. Request a new one.",
      })
    }

    if (otp !== recentOtp.otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    await User.findByIdAndUpdate(user._id, { password: hashedPassword })

    // Delete OTP
    await OTP.deleteMany({ email })

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
