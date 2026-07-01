# Payment Service

The payment service integrates Razorpay into the BuyKaro flow.

## Features
- Create Razorpay orders for checkout
- Verify payment signatures
- Publish payment success or failure notifications to the message queue

## How it is coded
- server.js starts the payment API
- src/app.js wires routes and connects to MongoDB and RabbitMQ
- src/routes/payment.route.js exposes payment endpoints
- src/controllers/payment.controller.js creates and verifies Razorpay payments
- src/model/payment.model.js stores payment state in MongoDB
- src/middleware/auth.middleware.js protects payment endpoints

## Main endpoints
- POST /api/payments/create/:orderId
- POST /api/payments/verify

## Environment variables
- MONGO_URI
- JWT_SECRET
- RABBIT_URL
- RAZORPAY_KEY_ID
- RAZORPAY_KEY_SECRET

## Run locally
```bash
cd payment
npm install
npm run dev
```
