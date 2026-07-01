const jwt = require("jsonwebtoken")

function createAuthMiddleware(role = ["user"]) {
    return function authMiddlewareCart(req, res, next) {
        let token = req.cookies.token;
        const authHeader = req.headers?.authorization;

        console.log('Cart auth middleware request:', {
            authorizationHeader: authHeader ? authHeader.slice(0, 20) : null,
            hasCookieToken: Boolean(req.cookies.token),
        });

        if (!token && authHeader) {
            const parts = authHeader.split(' ');
            token = parts.length === 2 ? parts[1] : authHeader;
        }

        if(!token){
            return res.status(401).json({
                message:"Unauthorized: No Token Provided"
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
            console.error('Cart auth token invalid:', error.message);
            return res.status(401).json({
                message: error.message
            })
        }

    }
}

module.exports={createAuthMiddleware}