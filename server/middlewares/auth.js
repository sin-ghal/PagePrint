const jwt = require("jsonwebtoken")

//authorisation
exports.auth = async(req,res,next)=>{
    try{
        const token =
  req.cookies?.token ||
  req.body?.token ||
  req.header("Authorization")?.replace("Bearer ", "")
    //check token existense
    if(!token){
        return res.status(401).json({
            success:false,
            message:"Token is missing"
        })
    }

//verify the token
    try{
        const decode = jwt.verify(token,process.env.JWT_SECRET);
        console.log(decode);

        req.user=decode

    }catch(e){
        console.error(e)
        return res.status(401).json({
            success: false,
            message: "token invalid",
        })
    }
// move to next middleware
    next();

    }catch(e){
        console.error(e)
        return res.status(500).json({
            success: false,
            message: "something went wrong while validating the token",
        })
    }
}