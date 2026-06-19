const { tool } = require("@langchain/core/tools");
const { z } = require("zod");
const axios = require("axios");

const searchProduct = tool(
    async (data) => {

        const searchQuery =
            typeof data === "string"
                ? data
                : data.input || data.query;

        const token =
            typeof data === "object"
                ? data.token
                : undefined;

        console.log("Search Query:", searchQuery);

        const response = await axios.get(
            `http://localhost:3001/api/products?q=${encodeURIComponent(searchQuery)}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const products = response.data.data || [];

        if (products.length === 0) {
            return JSON.stringify({
                found: false
            });
        }

        // Return only first product
        return JSON.stringify({
            found: true,
            productId: products[0]._id,
            title: products[0].title,
            price: products[0].price.amount
        });
    },
    {
        name: "searchProduct",
        description:
            "Search products and return best matching product",
        inputSchema: z.object({
            input: z.string().optional(),
            query: z.string().optional(),
            token: z.string().optional()
        })
    }
);

const addProductToCart = tool(
    async (data) => {
        const productId = data.productId || data.input;
        const qty = data.qty || 1;
        const token = typeof data === "object" ? data.token : undefined;

        // Avoid logging tokens; log only productId for traceability
        console.log("Add To Cart: productId=", productId, "qty=", qty);

        try {
            const response = await axios.post(
                "http://localhost:3002/api/cart/items",
                {
                    productId,
                    qty
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            return JSON.stringify(response.data);
        } catch (err) {
            console.error(err.response?.data || err.message);
            return "Failed to add product to cart";
        }
    },
    {
        name: "addProductToCart",
        description: "Add product to shopping cart using productId",
        inputSchema: z.object({
            productId: z.string().optional(),
            input: z.string().optional(),
            qty: z.number().optional(),
            token: z.string().optional()
        })
    }
);

module.exports = {
    searchProduct,
    addProductToCart
};