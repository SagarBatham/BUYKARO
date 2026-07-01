# Order Service

The order service handles checkout and order management for BuyKaro.

## Features
- Create orders from the current cart
- View orders for the authenticated user
- Fetch a specific order by ID
- Cancel pending orders
- Update shipping address before fulfillment

## How it is coded
- server.js boots the service
- src/app.js connects to MongoDB and RabbitMQ and mounts routes
- src/routes/order.routes.js exposes order endpoints
- src/controller/order.controller.js contains the core business logic
- src/model/order.model.js defines the order schema and address subdocument
- src/middleware/auth.middleware.js checks user permissions
- src/broker/broker.js publishes order events to other services

## Main endpoints
- POST /api/orders
- GET /api/orders/me
- GET /api/orders/:id
- POST /api/orders/:id/cancel
- PATCH /api/orders/:id/address

## Environment variables
- MONGO_URI
- JWT_SECRET
- RABBIT_URL

## Run locally
```bash
cd order
npm install
npm run dev
```
