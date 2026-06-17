const jwt = require("jsonwebtoken")

function createAuthMiddleware(role = ["user", "seller"]) {
    return function authMiddlewareCart(req, res, next) {

        const token =
            req.cookies?.token ||
            req.headers?.authorization?.split(" ")[1];

        console.log("Token:", token);
        console.log("Type:", typeof token);

        if (!token) {
            return res.status(401).json({
                message: "Unauthorized: No Token Provided"
            });
        }

        try {
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );

            console.log(decoded);

            if (!role.includes(decoded.role)) {
                return res.status(403).json({
                    message: "No Permission"
                });
            }

            req.user = decoded;

            return next();

        } catch (error) {
            return res.status(401).json({
                error: error.message
            });
        }
    };
}

module.exports = { createAuthMiddleware };
