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

        const getHeaders = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await axios.get(
            `http://localhost:3001/api/products?q=${encodeURIComponent(searchQuery)}`,
            {
                headers: getHeaders
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
        const productId =
            typeof data === "string"
                ? data
                : data.productId || data.input;
        const qty = typeof data === "object" ? data.qty || 1 : 1;
        const token = typeof data === "object" ? data.token : undefined;

        // Avoid logging tokens; log only productId for traceability
        console.log("Add To Cart: productId=", productId, "qty=", qty);

        // Debug info: inspect incoming data shape (do not print token value)
        try {
            const dataKeys = data && typeof data === 'object' ? Object.keys(data) : typeof data;
            console.log('addProductToCart dataKeys=', dataKeys, 'tokenType=', typeof token, 'hasToken=', !!token);
        } catch (e) {
            // ignore
        }

        try {
            const postHeaders = token ? { Authorization: `Bearer ${token}` } : {};

            // Debug: confirm whether Authorization header will be sent (no token printed)
            console.log("Posting to cart, hasAuthHeader=", !!postHeaders.Authorization);

            const response = await axios.post(
                "http://localhost:3002/api/cart/items",
                {
                    productId,
                    qty
                },
                {
                    headers: postHeaders
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