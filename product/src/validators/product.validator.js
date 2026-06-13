const { body, validationResult } = require('express-validator')

const handleValidation = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
  next()
}


const productCreateValidator = [
  body('title')
    .notEmpty()
    .withMessage('title is required'),
  // Accept price as a primitive (string/number) or an object like { amount }
  body('price')
    .custom((value) => {
      let amount = value
      if (typeof value === 'object' && value !== null) {
        if ('amount' in value) amount = value.amount
        else return false
      }

      if (typeof amount === 'string' && amount.trim() === '') return false
      const num = Number(amount)
      if (Number.isNaN(num)) return false
      return num > 0
    })
    .withMessage('price must be a positive number'),
  body('currency')
    .optional()
    .isString()
    .withMessage('currency must be a string'),
  handleValidation
]


module.exports = { productCreateValidator, handleValidation }
