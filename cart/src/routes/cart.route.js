const express=require("express")

const router = express.Router()
const middlewaresCart = require("../middleware/auth.middleware")
const validation = require("../middleware/validation.middleware")
const cartController = require("../controller/cart.controller")

// Get cart for authenticated user
router.get("/", cartController.getCart)

// Add item to cart
router.post("/items", cartController.addItemtoCart)

// Update item quantity
router.patch("/items/:productId", cartController.updateItemQty)

// Delete single item
router.delete("/items/:productId", cartController.deleteItem)

// Clear cart
router.delete("/", cartController.clearCart)

module.exports = router