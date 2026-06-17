const orderModel = require("../model/order.model");
const axios = require("axios");

async function createOrder(req, res) {

    const user = req.user;

    const token =
        req.cookies?.token ||
        req.headers?.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized"
        });
    }

    try {

        const cartResponse = await axios.get(
            "http://localhost:3002/api/cart",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const products = await Promise.all(cartResponse.data.cart.items.map(async (item) => {

            return (await axios.get(`http://localhost:3001/api/products/${item.productId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })).data.product
        }))

        let priceAmount = 0;
        const orderItems = cartResponse.data.cart.items.map((item, index) => {
            const product = products.find(p => p._id === item.productId)

            if (product.Stock < item.quantity) {
                throw new Error(`Product ${product.title} is out of stock or insufficient`)
            }
            const itemTotal = product.price.amount * item.quantity
            priceAmount += itemTotal
            return {
                product: item.productId,
                quantity: item.quantity,
                price: {
                    amount: itemTotal,
                    currency: product.price.currency
                }
            }
        })
        const order = await orderModel.create({
            user: user.id,
            items: orderItems,
            status: "PENDING",
            totalPrice: {
                amount: priceAmount,
                currency: "INR"
            },
            shippingAddress: req.body.shippingAddress
        })




        return res.status(200).json({
            order
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
}

async function getMyOrder(req,res){
    const user=req.user

    const page=parseInt(req.query.page || 1)
    const limit=parseInt(req.query.limit || 10)
    const skip=(page-1) * limit

    try {
        const order=await orderModel.find({user:user.id})
        const totalOrders = await orderModel.countDocuments({user:user.id})

        res.status(200).json({
            order,
            meta:{
                total:totalOrders,
                page,
                limt
            }
        })
    } catch (error) {
        res.status(500).json({message:"Internal Server Error"})
    }
}

async function getOrderbyId(req,res) {
    const user=req.user
    const orderId =req.params.id

    try {
        const order=await orderModel.findById(orderId)

        if(!order){
            return res.status(404).json({
                message:"Order not Found"
            })
        }

        if(order.user.toString()!=user.id){
            return res.status(403).json({message:"Fordbidden: You do not have access"})
        }

        return res.status(200).json({Orders:order})
    } catch (error) {
        res.status(500).json({
            message:"Internal Server Error"
        })
    }
}

async function cancelOrder(req,res) {
    const orderId=req.params.id
    const user=req.user
    try {
        const order=await orderModel.findById(orderId)

        if(!order){
            return res.status(404).json({message:"Order not found"})
        }

        if(order.user.toString()!==user.id){
            return res.status(403).json({message:"Forbidden! You have not access"})
        }

        if(order.status.toString()!=="PENDING"){
            return res.status(409).json({message:"Order cannot be cancelled at this Point"})
        }

        order.status="CANCELLED"
        order.timeline.push({type:"CANCELLED", at:new Date() })

        await order.save()

        res.status(200).json({Orders: order})
    } catch (error) {
        res.status(500).json({
            message:"Internal Server Error",
            Error:error.message
        })
    }
}

async function updateAddress(req,res) {
    const user=req.user
    const orderId=req.params.id

    try {
        const order=await orderModel.findById(orderId)

        if(!order){
            return res.status(404).json({message:"Order not Found"})
        }

        if(order.user.toString()!==user.id){
            return res.status(403).json({message:"Forbidden: You do not have access"})
        }

        if(order.status!=="PENDING"){
            return res.status(409).json({message:"Order Address cannot be Updated"})
        }

        order.shippingAddress={
            street:req.body.shippingAddress.street,
            city:req.body.shippingAddress.city,
            state:req.body.shippingAddress.state,
            zip:req.body.shippingAddress.zip,
            country:req.body.shippingAddress.country,
        }

        await order.save()


        return res.status(200).json({Orders: order})

    } catch (error) {
        res.status(500).json({
            message:"Internal Server Error",
            Error:error.message
        })
    }
}

module.exports = { createOrder ,getMyOrder ,getOrderbyId ,cancelOrder ,updateAddress};