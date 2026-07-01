const { validationResult } = require("express-validator")
const userModel = require("../model/user.model")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const redis = require("../db/redis")
const { publishToQueue } = require("../broker/broker")

async function registerUser(req, res) {
    const { username: incomingUsername, email, password, fullName: {
        firstName, lastName},role } = req.body

    const emailLocalPart = (email || '').split('@')[0] || ''
    const derivedUsername = (incomingUsername || emailLocalPart || `${firstName || 'user'}`)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9._-]/g, '')
        .slice(0, 20)

    const username = derivedUsername || `user${Date.now()}`

    const isUserAlreadyExists = await userModel.findOne({
        $or: [
            { username },
            { email }
        ]
    })

    if (isUserAlreadyExists) {
        res.status(409).json({
            msg: 'User Already Exists'
        })
    }

    const hash = await bcrypt.hash(password, 10)

    const user = await userModel.create({
        username,
        email,
        password: hash,
        fullName: { firstName, lastName },
        role: role || "user"
    })
    

    await Promise.allSettled([
        publishToQueue("AUTH_NOTIFICATION.USER_CREATED",{
        id:user.id,
        username:user.username,
        email:user.email,
        fullName:user.fullName,
    }),

    publishToQueue("AUTH_SELLER_DASHBOARD.USER_CREATED",user)
    ])
    
    const token = jwt.sign({
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
    }, process.env.JWT_SECRET, { expiresIn: "1d" })

    res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        maxAge: 24 * 60 * 60 * 1000
    })

    res.status(201).json({
        message: "User Registered Succesfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            fullName: { firstName, lastName },
            role: user.role,
            addresses: user.addresses
        }
    })

}

async function loginUser(req, res) {
    const { email, username, password } = req.body

    const query = (email && username) ? { $or: [{ email }, { username }] } : (email ? { email } : { username })

    const user = await userModel.findOne(query).select('+password')

    if (!user) {
        return res.status(404).json({ msg: 'User not found' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        return res.status(401).json({ msg: 'Invalid credentials' })
    }

    const token = jwt.sign({
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
    }, process.env.JWT_SECRET, { expiresIn: '1d' })

    res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        maxAge: 24 * 60 * 60 * 1000
    })

    res.status(200).json({
        message: 'Login successful',
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            addresses: user.addresses
        }
    })
}

async function getCurrentUser(req, res) {
    return res.status(200).json({
        message: "Current User Fetched Successfully",
        user: req.user
    })
}

async function logoutUser(req, res) {
    try {
        const token = req.cookies && req.cookies.token

        if (token) {
            await redis.set(`blacklist:${token}`, 'true', 'EX', 24 * 60 * 60)
        }

        res.clearCookie('token', {
            httpOnly: true,
            secure: true
        })

        return res.status(200).json({ message: 'Logged out successfully' })
    } catch (err) {
        console.error('Logout error', err)
        return res.status(500).json({ message: 'Logout failed' })
    }
}

async function getUserAdresses(req, res) {
    try {
        const id = req.user.id
        const user = await userModel.findById(id)
        if (!user) return res.status(404).json({ message: 'User not Found' })
        return res.status(200).json({
            message: 'User addresses fetched successfully',
            addresses: user.addresses
        })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Failed to fetch addresses' })
    }
}

async function addUserAdresses(req, res) {
    try {
        const id = req.user.id
        const { street, city, state, zip, pincode, country, phone, isDefault } = req.body

        const zipVal = zip || pincode

        const user = await userModel.findById(id)
        if (!user) return res.status(404).json({
            message: 'User not Found'
        })

        if (isDefault) {
            user.addresses.forEach((a) => { a.isDefault = false })
        }

        const newAddr = { street, city, state, zip: zipVal, country, phone, isDefault: !!isDefault }
        user.addresses.push(newAddr)
        await user.save()

        const saved = user.addresses[user.addresses.length - 1]
        return res.status(201).json({ message: 'Address added Successfully', address: saved })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Failed to add address' })
    }
}

async function markAddressDefault(req, res) {
    try {
        const id = req.user.id
        const addrId = req.params.addressId
        const user = await userModel.findById(id)
        if (!user) return res.status(404).json({
            message: 'User not Found'
        })

        const addr = user.addresses.id(addrId)
        if (!addr) return res.status(404).json({
            message: 'Address not Found'
        })

        user.addresses.forEach((a) => { a.isDefault = false })
        addr.isDefault = true
        await user.save()
        return res.status(200).json({ message: 'Default address set', address: addr })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Failed to set default address' })
    }
}

async function deleteAddress(req, res) {
    try {
        const id = req.user.id
        const addrId = req.params.addressId
        const user = await userModel.findById(id)
        if (!user) return res.status(404).json({ message: 'User not Found' })

        const addr = user.addresses.id(addrId)
        if (!addr) return res.status(404).json({ message: 'Address not Found' })

        // remove subdocument via filter to avoid calling remove() on plain objects
        user.addresses = user.addresses.filter((a) => String(a._id) !== String(addrId))
        await user.save()
        return res.status(200).json({ message: 'Address removed' })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Failed to remove address' })
    }
}
module.exports = {
    registerUser,
    loginUser,
    getCurrentUser,
    logoutUser,
    getUserAdresses,
    addUserAdresses,
    markAddressDefault,
    deleteAddress
}