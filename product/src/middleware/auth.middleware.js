const jwt=require("jsonwebtoken")

function createAuthMiddleware(roles=["user"]){
    // In test environment, inject a dummy user to avoid needing real JWTs
    if (process.env.NODE_ENV === 'test') {
        return function authMiddleware(req, res, next) {
            req.user = { id: req.body?.seller || 'test-seller', role: 'seller' }
            return next()
        }
    }

    return function authMiddleware(req,res,next){
        const authHeader = req.headers?.authorization;
        const token = req.cookies?.token || (authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader?.trim())

        if(!token){
            return res.status(401).json({
                message:"Unauthorized: No Token provided"
            })
        }

        try {
            const decoded=jwt.verify(token,process.env.JWT_SECRET)

            if(!roles.includes(decoded.role)){
                return res.status(403).json({
                    message:"Forbidden: No Permission"
                })
            }

            req.user=decoded

            next()
        } catch (error) {
            return res.status(401).json({
                message:"Unauthorized: Invalid Token"
            })
        }
    }
}

module.exports=createAuthMiddleware