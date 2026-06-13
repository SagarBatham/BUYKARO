const express = require("express")
const multer = require("multer")
const { createProduct, getProducts, getProductsbyID, updateProducts, deleteProducts, getProductsbySeller } = require("../controllers/product.controller")
const createAuthMiddleware = require("../middleware/auth.middleware")
const { productCreateValidator} = require('../validators/product.validator')
const router = express.Router()

const storage = multer.memoryStorage()
const upload = multer({ storage })

router.post('/',
    createAuthMiddleware(["admin", "seller"]),
    upload.any(),
    productCreateValidator,
    createProduct)

router.get('/',getProducts)


router.patch("/:id",createAuthMiddleware(["seller"]),updateProducts)

router.delete("/:id",createAuthMiddleware(["seller"]),deleteProducts)

router.get("/seller",createAuthMiddleware(["seller"]),getProductsbySeller)
console.log('Route registered: GET /api/products/seller')

router.get("/:id",getProductsbyID)

module.exports = router