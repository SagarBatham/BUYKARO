# Cart Service

The cart service manages a user’s shopping cart.

## Features
- Retrieve the current cart
- Add items to cart
- Update item quantities
- Remove items
- Clear the cart

## How it is coded
- server.js starts the HTTP server
- src/app.js wires the cart routes
- src/routes/cart.route.js exposes cart endpoints
- src/controller/cart.controller.js contains the add/update/delete/cart logic
- src/model/cart.model.js stores cart data with Mongoose
- src/middleware/auth.middleware.js ensures only authorized users can access cart routes

## Main endpoints
- GET /api/cart
- POST /api/cart/items
- PATCH /api/cart/items/:productId
- DELETE /api/cart/items/:productId
- DELETE /api/cart

## Environment variables
- MONGO_URI
- JWT_SECRET

## Run locally
```bash
cd cart
npm install
npm run dev
```
