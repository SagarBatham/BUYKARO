const userModel=require("../model/user.model")
const jwt=require("jsonwebtoken")

async function authMiddleware(req,res,next){
    const authHeader = req.headers?.authorization;
    const token = req.cookies?.token || (authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader?.trim());

    if(!token){
        return res.status(401).json({message:"Unauthorized"})
    }

    try {
        const decoded=jwt.verify(token,process.env.JWT_SECRET)

        const user=decoded

        req.user=user

        next()
    } catch (error) {
        return res.status(401).json({message:"Unauthorized"})
    }
}

module.exports={authMiddleware}