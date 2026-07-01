const { body, validationResult } = require("express-validator")

const responseWithValidation = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    next()
}

const registerUserValidation = [
    body("username")
        .optional({ values: 'falsy' })
        .isString()
        .withMessage("Username must be a String")
        .isLength({ min: 3 })
        .withMessage("Username must be at least 3 Characters long"),
    body("email")
        .isEmail()
        .withMessage("Invalid Email"),
    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must at least 6 characters"),
    body("fullName.firstName")
        .isString()
        .withMessage("First name must be String")
        .notEmpty()
        .withMessage("First Name is required"),
    body("fullName.lastName")
        .isString()
        .withMessage("Last name must be String")
        .notEmpty()
        .withMessage("Last Name is required"),
    body("role")
        .optional()
        .isIn(["user","seller"])
        .withMessage("Role must be either User or Seller"),
    responseWithValidation
]

const loginValidation = [
    body("email")
        .optional()
        .isEmail().withMessage("Invalid Email"),
    body("username")
        .optional()
        .isString().withMessage("Username must be a string")
        .isLength({ min: 3 }).withMessage("Username must be at least 3 characters"),
    body("password")
        .notEmpty().withMessage("Password is required"),
    // ensure either email or username is provided
    (req, res, next) => {
        if (!req.body.email && !req.body.username) {
            return res.status(400).json({ errors: [{ msg: 'Either email or username is required' }] })
        }
        next()
    },
    responseWithValidation
]

const addUserAddressValidation = [
    body("street")
        .isString()
        .withMessage("Street must be a String")
        .notEmpty()
        .withMessage("Street is Required"),
    body("city")
        .isString()
        .withMessage("City must be a String")
        .notEmpty()
        .withMessage("City is Required"),
    body("state")
        .isString()
        .withMessage("State must be a String")
        .notEmpty()
        .withMessage("State is Required"),
    body("zip")
        .isString()
        .withMessage("Zip must be a String")
        .notEmpty()
        .withMessage("Zip is Required"),
    body("phone")
        .isString()
        .optional()
        .isString()
        .withMessage("Phone must be a String"),
    body("isDefault")
        .optional()
        .isBoolean()
        .withMessage("isDefault must be a boolean"),
    responseWithValidation
]

module.exports = {
    registerUserValidation, 
    loginValidation ,
    addUserAddressValidation
}
