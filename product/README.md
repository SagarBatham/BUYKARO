# Product Service

The product service powers the BuyKaro catalog.

## Features
- Create products
- Fetch products with text and price filters
- Get a single product by ID
- Update and delete seller-owned products
- List products owned by a seller
- Upload product images with ImageKit

## How it is coded
- server.js starts the service
- src/app.js registers the product routes
- src/routes/product.routes.js exposes the product endpoints
- src/controllers/product.controller.js contains the business logic for CRUD and filtering
- src/model/product.model.js defines the product schema
- src/services/imageService.js uploads image files to ImageKit
- src/middleware/auth.middleware.js enforces seller/admin access
- src/validators handles request validation for product creation
- src/broker/broker.js publishes events when products are created

## Main endpoints
- POST /api/products
- GET /api/products
- GET /api/products/:id
- PATCH /api/products/:id
- DELETE /api/products/:id
- GET /api/products/seller

## Environment variables
- MONGO_URI
- JWT_SECRET
- RABBIT_URL
- IMAGEKIT_PUBLIC_KEY
- IMAGEKIT_PRIVATE_KEY
- IMAGEKIT_URL_ENDPOINT

## Run locally
```bash
cd product
npm install
npm run dev
```
