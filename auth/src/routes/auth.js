const express = require('express')
const router = express.Router()
const validators=require("../middleware/validator.middleware")
const authController=require("../controllers/auth.controller")
const authMiddleWare=require("../middleware/auth.middleware")
const User = require('../model/user.model')

router.post('/register',validators.registerUserValidation,authController.registerUser)

router.post('/login', validators.loginValidation, authController.loginUser)

router.get("/me",authMiddleWare.authMiddleware,authController.getCurrentUser)

router.get("/logout",authController.logoutUser)

router.get('/users/me/addresses', authMiddleWare.authMiddleware, authController.getUserAdresses)

router.post('/users/me/addresses', authMiddleWare.authMiddleware, validators.addUserAddressValidation, authController.addUserAdresses)

router.post('/users/me/addresses/:addressId/default', authMiddleWare.authMiddleware, authController.markAddressDefault)

router.delete('/users/me/addresses/:addressId', authMiddleWare.authMiddleware, authController.deleteAddress)

module.exports = router
