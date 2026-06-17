const express = require("express");
const { createAuthMiddleware } = require("../middleware/auth.middleware");
const validation = require("../middleware/validator.middleware");
const controllers = require("../controller/order.controller");

const router = express.Router();

router.post(
    "/",
    validation.createOrderValidation,
    createAuthMiddleware(["user"]),
    controllers.createOrder
);

router.get(
    "/me",
    createAuthMiddleware(["user"]),
    controllers.getMyOrder
);

router.get(
    "/:id",
    createAuthMiddleware(["user", "admin"]),
    controllers.getOrderbyId
);

router.post(
    "/:id/cancel",
    createAuthMiddleware(["user"]),
    controllers.cancelOrder
);

router.patch(
    "/:id/address",
    validation.updateAddressValidation,
    createAuthMiddleware(["user"]),
    controllers.updateAddress
);

module.exports = router;