const cartModel = require("../model/cart.model");
const mongoose=require("mongoose")
// Helper: ensure numeric quantity from either `qty` or `quantity`
function normalizeQty(body) {
    if (typeof body.quantity === "number") return body.quantity;
    if (typeof body.qty === "number") return body.qty;
    return null;
}

// In-memory cart used when no authenticated user is present (useful for tests)
const inMemoryCart = { items: [] };

async function getCart(req, res) {
    const user = req.user;

    if (!user) {
        return res.status(200).json({ items: inMemoryCart.items });
    }

    let cart = await cartModel.findOne({ user: user.id });

    if (!cart) {
        return res.status(200).json({ items: [] });
    }

    return res.status(200).json({ message:"Cart Fetched Succesfully",
        cart
     });
}

async function addItemtoCart(req, res) {
    const { productId } = req.body;
    const quantity = normalizeQty(req.body);

    if (!productId || typeof quantity !== "number") {
        return res
            .status(400)
            .json({ error: "productId and numeric qty required" });
    }

    const user = req.user;

    console.log(user);
    if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({
        message: "Invalid Product ID"
    });
}

    if (!user) {
        const existing = inMemoryCart.items.find(
            (i) => i.productId === productId
        );

        if (existing) {
            existing.qty += quantity;
        } else {
            inMemoryCart.items.push({
                productId,
                qty: quantity,
            });
        }

        return res.status(201).json({
            productId,
            qty: quantity,
        });
    }

    let cart = await cartModel.findOne({ user: user.id });

    if (!cart) {
        cart = new cartModel({
            user: user.id,
            items: [],
        });
    }

    const existingItemIdx = cart.items.findIndex(
        (item) => item.productId.toString() === productId
    );

    if (existingItemIdx >= 0) {
        cart.items[existingItemIdx].quantity += quantity;
    } else {
        cart.items.push({
            productId,
            quantity,
        });
    }

    await cart.save();

    return res.status(201).json({
        message: "Added to Cart",
        cart,
    });
}

async function updateItemQty(req, res) {
    const { productId } = req.params;
    const qty = normalizeQty(req.body);

    if (typeof qty !== "number") {
        return res.status(400).json({
            error: "numeric qty required",
        });
    }

    const user = req.user;

    if (!user) {
        const item = inMemoryCart.items.find(
            (i) => i.productId === productId
        );

        if (!item) {
            return res.status(404).json({
                error: "Item not found",
            });
        }

        item.qty = qty;

        return res.status(200).json({
            productId,
            qty: item.qty,
        });
    }

    const cart = await cartModel.findOne({
        user: user.id,
    });

    if (!cart) {
        return res.status(404).json({
            error: "Cart not found",
        });
    }

    const item = cart.items.find(
        (i) => i.productId.toString() === productId
    );

    if (!item) {
        return res.status(404).json({
            error: "Item not found",
        });
    }

    item.quantity = qty;

    await cart.save();

    return res.status(200).json({
        productId,
        qty: item.quantity,
    });
}

async function deleteItem(req, res) {
    const { productId } = req.params;
    const user = req.user;

    if (!user) {
        const idx = inMemoryCart.items.findIndex(
            (i) => i.productId === productId
        );

        if (idx === -1) {
            return res.status(204).send();
        }

        inMemoryCart.items.splice(idx, 1);

        return res.status(200).json({
            success: true,
        });
    }

    const cart = await cartModel.findOne({
        user: user.id,
    });

    if (!cart) {
        return res.status(204).send();
    }

    const idx = cart.items.findIndex(
        (i) => i.productId.toString() === productId
    );

    if (idx === -1) {
        return res.status(204).send();
    }

    cart.items.splice(idx, 1);

    await cart.save();

    return res.status(200).json({
        success: true,
    });
}

async function clearCart(req, res) {
    const user = req.user;

    if (!user) {
        inMemoryCart.items = [];
        return res.status(204).send();
    }

    const cart = await cartModel.findOne({
        user: user.id,
    });

    if (!cart) {
        return res.status(204).send();
    }

    cart.items = [];

    await cart.save();

    return res.status(204).send();
}

module.exports = {
    addItemtoCart,
    getCart,
    updateItemQty,
    deleteItem,
    clearCart,
};