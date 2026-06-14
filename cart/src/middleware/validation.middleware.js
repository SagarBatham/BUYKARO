const { body, validationResult } = require("express-validator")
const mongoose=require("mongoose")

function validateResult(req, res, next) {
    const error = validateAddItemToCart(req)

    if (!error.isEmpty()) {
        return res.status(400).json({
            error: error.array()
        })
    }
}

const validateAddItemToCart = [
    body('productId')
        .isString()
        .withMessage('Product ID must be a String')
        .custom(value=>mongoose.Schema.Types.isValid(valid))
        .withMessage("Invalid Product ID Format"),
    body('items.quantity')
        .isInt({ gt: 0 })
        .withMessage('Quantity must be a Positive Integer'),
    validateResult
]

module.exports={validateAddItemToCart}