const jwt = require("jsonwebtoken")

function createAuthMiddleware(role = ["user"]) {
    return function authMiddlewareCart(req, res, next) {
        const { token } = req.cookies || req.header.authorization?.split(' ')[1];

        if(!token){
            res.status(401).json({
                message:"Unauthorized:No Token Provided"
            })
        }
        
        try {
            const decoded=jwt.verify(token,process.env.JWT_SECRET)

            if(!role.includes(decoded.role)){
                return res.status(403).json({
                    message:"No Permission"
                })
            }

            req.user=decoded

            next()
        } catch (error) {
            return res.status(404).json({
                Error:error.message
            })
        }

    }
}

module.exports={createAuthMiddleware}