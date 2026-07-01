const { publishToQueue } = require("../broker/broker");
const orderModel = require("../model/order.model");
const axios = require("axios");

const CART_SERVICE_BASE_URL = process.env.CART_SERVICE_URL || 'https://cart-service-q4y8.onrender.com'
const PRODUCT_SERVICE_BASE_URL = process.env.PRODUCT_SERVICE_URL || 'https://product-service-wxqz.onrender.com'

async function createOrder(req, res) {

    const user = req.user;

    const authHeader = req.headers?.authorization;
    const token =
        req.cookies?.token ||
        (authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader);

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized"
        });
    }

    try {
        console.log('createOrder request payload:', {
            userId: user?.id,
            shippingAddress: req.body?.shippingAddress,
            items: req.body?.items,
            tokenPresent: !!token,
        });

        const bodyItems = Array.isArray(req.body.items) ? req.body.items : [];

        let cartItems = [];
        try {
            const cartResponse = await axios.get(
                `${CART_SERVICE_BASE_URL}/api/cart`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            console.log('Cart service response:', cartResponse.data);
            cartItems = cartResponse.data?.cart?.items || cartResponse.data?.items || [];
        } catch (cartError) {
            console.error('Cart fetch failed, falling back to request body items:', {
              status: cartError.response?.status,
              data: cartError.response?.data,
              message: cartError.message,
            });
            cartItems = [];
        }

        if (!Array.isArray(cartItems) || cartItems.length === 0) {
            cartItems = bodyItems;
        }

        if (!Array.isArray(cartItems) || cartItems.length === 0) {
            return res.status(400).json({
                message: 'Cart is empty or unavailable'
            });
        }

        const normalizedCartItems = cartItems.map((item) => ({
            productId: item.product || item.productId,
            quantity: item.quantity || item.qty || 1,
        }));

        const products = await Promise.all(normalizedCartItems.map(async (item) => {
            const productResponse = await axios.get(
                `${PRODUCT_SERVICE_BASE_URL}/api/products/${item.productId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            console.log('Product service response for', item.productId, productResponse.data);
            return productResponse.data.product;
        }));

        let priceAmount = 0;
        const orderItems = normalizedCartItems.map((item) => {
            const product = products.find((p) => p._id.toString() === item.productId.toString());

            if (!product) {
                throw new Error(`Product ${item.productId} not found`);
            }

            if (product.stock < item.quantity) {
                throw new Error(`Product ${product.title} is out of stock or insufficient`);
            }

            const itemTotal = product.price.amount * item.quantity;
            priceAmount += itemTotal;
            return {
                product: item.productId,
                quantity: item.quantity,
                price: {
                    amount: itemTotal,
                    currency: product.price.currency,
                },
            };
        });
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
            data: order
        });

    } catch (error) {
        console.error('createOrder error:', {
          name: error.name,
          message: error.message,
          stack: error.stack,
          responseData: error.response?.data,
          responseStatus: error.response?.status,
        });

        if (error.response) {
            return res.status(error.response.status).json(error.response.data);
        }

        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message || 'Unknown error'
        });
    }
}

async function getMyOrder(req,res){
    const user=req.user

    const page=parseInt(req.query.page || 1)
    const limit=parseInt(req.query.limit || 10)
    const skip=(page-1) * limit

    try {
        const orders = await orderModel.find({user:user.id})
        const totalOrders = await orderModel.countDocuments({user:user.id})

        res.status(200).json({
            data: orders,
            meta: {
                total: totalOrders,
                page,
                limit
            }
        })
    } catch (error) {
        console.error('getMyOrder error', error);
        res.status(500).json({message:"Internal Server Error"})
    }
}

async function getOrderbyId(req,res) {
    const user=req.user
    const orderId =req.params.id

    const authHeader = req.headers?.authorization;
    const token =
        req.cookies?.token ||
        (authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader);

    try {
        const order=await orderModel.findById(orderId)

        await publishToQueue("ORDER_SELLER_DASHBOARD.ORDER_CREATED",order)

        if(!order){
            return res.status(404).json({
                message:"Order not Found"
            })
        }

        if(order.user.toString()!=user.id){
            return res.status(403).json({message:"Fordbidden: You do not have access"})
        }

        let enrichedItems = []
        try {
            enrichedItems = await Promise.all(order.items.map(async (item) => {
                const productResponse = await axios.get(
                    `${PRODUCT_SERVICE_BASE_URL}/api/products/${item.product}`,
                    {
                        headers: {
                            Authorization: token ? `Bearer ${token}` : undefined,
                        },
                    }
                );

                const productData =
                    productResponse.data?.product ||
                    productResponse.data?.data?.product ||
                    productResponse.data;

                return {
                    ...item.toObject(),
                    product: productData,
                };
            }));
        } catch (productError) {
            console.error('Failed to enrich order items with product details:', {
                orderId,
                error: productError.message,
                responseData: productError.response?.data,
            });
            enrichedItems = order.items.map((item) => ({ ...item.toObject() }));
        }

        const orderObj = order.toObject();
        orderObj.items = enrichedItems;

        return res.status(200).json({ data: orderObj })
    } catch (error) {
        console.error('getOrderbyId error', error);
        res.status(500).json({
            message:"Internal Server Error"
        })
    }
}

async function confirmOrder(req, res) {
    const orderId = req.params.id
    const user = req.user

    try {
        const order = await orderModel.findById(orderId)

        if (!order) {
            return res.status(404).json({ message: "Order not Found" })
        }

        if (order.user.toString() !== user.id) {
            return res.status(403).json({ message: "Forbidden: You do not have access" })
        }

        if (order.status !== "PENDING") {
            return res.status(409).json({ message: "Order cannot be confirmed" })
        }

        order.status = "CONFIRMED"
        order.timeline.push({ type: "CONFIRMED", at: new Date() })

        await order.save()

        return res.status(200).json({ data: order })
    } catch (error) {
        console.error('confirmOrder error', error);
        res.status(500).json({
            message: "Internal Server Error",
            Error: error.message,
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

        res.status(200).json({ data: order })
    } catch (error) {
        console.error('cancelOrder error', error);
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


        return res.status(200).json({ data: order })

    } catch (error) {
        console.error('updateAddress error', error);
        res.status(500).json({
            message:"Internal Server Error",
            Error:error.message
        })
    }
}

module.exports = { createOrder, getMyOrder, getOrderbyId, confirmOrder, cancelOrder, updateAddress };