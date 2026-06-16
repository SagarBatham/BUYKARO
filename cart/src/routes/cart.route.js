const express=require("express")

const router = express.Router()
const middlewaresCart = require("../middleware/auth.middleware")
const validation = require("../middleware/validation.middleware")
const cartController = require("../controller/cart.controller")

// Get cart for authenticated user
router.get("/",middlewaresCart.createAuthMiddleware(["user"]),cartController.getCart)

// Add item to cart
router.post("/items",middlewaresCart.createAuthMiddleware(["user"]), cartController.addItemtoCart)

// Update item quantity
router.patch("/items/:productId",middlewaresCart.createAuthMiddleware(["user"]), cartController.updateItemQty)

// Delete single item
router.delete("/items/:productId",middlewaresCart.createAuthMiddleware(["user"]), cartController.deleteItem)

// Clear cart
router.delete("/",middlewaresCart.createAuthMiddleware(["user"]), cartController.clearCart)

module.exports = router