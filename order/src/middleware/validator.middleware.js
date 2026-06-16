const { body, validationResult } = require("express-validator")

const responseWithValidation = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    next()
}

const createOrderValidation = [
    body("shippingAddress.street")
        .isString()
        .withMessage("Street must be a String")
        .notEmpty()
        .withMessage("Street is Required"),
    body("shippingAddress.city")
        .isString()
        .withMessage("City must be a String")
        .notEmpty()
        .withMessage("City is Required"),
    body("shippingAddress.state")
        .isString()
        .withMessage("State must be a String")
        .notEmpty()
        .withMessage("State is Required"),
    body("shippingAddress.zip")
        .isString()
        .withMessage("Zip must be a String")
        .notEmpty()
        .withMessage("Zip is Required"),
    responseWithValidation
]

const updateAddressValidation=[
    body("shippingAddress.street")
        .isString()
        .withMessage("Street must be a String")
        .notEmpty()
        .withMessage("Street is Required"),
    body("shippingAddress.city")
        .isString()
        .withMessage("City must be a String")
        .notEmpty()
        .withMessage("City is Required"),
    body("shippingAddress.state")
        .isString()
        .withMessage("State must be a String")
        .notEmpty()
        .withMessage("State is Required"),
    body("shippingAddress.zip")
        .isString()
        .withMessage("Zip must be a String")
        .notEmpty()
        .withMessage("Zip is Required"),
    responseWithValidation
]


module.exports={createOrderValidation,updateAddressValidation}