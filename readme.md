# BuyKaro

BuyKaro is a full-featured e-commerce backend built with Node.js microservices. It combines authentication, product catalog, cart, orders, payments, notifications, seller analytics, and an AI-powered shopping assistant into one platform.

## What is included

- User authentication and account management
- Product listing and seller-controlled catalog management
- Persistent shopping cart
- Checkout and order workflows
- Payment processing with Razorpay
- Email notifications through RabbitMQ
- AI concierge for product discovery and cart actions
- Seller dashboard with sales insights

## Service map

- Auth: user accounts, login, JWT, addresses
- Product: catalog CRUD and image uploads
- Cart: cart persistence and quantity updates
- Order: order lifecycle and address management
- Payment: payment initiation and verification
- Notification: queue-driven email messaging
- AI Buddy: assistant based on LangChain and LangGraph
- Seller Dashboard: seller metrics and order/product views

## Architecture

The system follows a service-oriented architecture:

- Express.js handles HTTP APIs in each service
- Mongoose connects each service to MongoDB
- RabbitMQ passes asynchronous events across services
- Redis stores token blacklist data in the auth workflow
- JWT secures authenticated routes
- Razorpay powers payment processing
- ImageKit stores and serves product images
- Socket.IO is used by the AI buddy service for real-time interaction capabilities

## Core features

### Authentication and user management
- User registration with role support for user and seller
- Login with JWT token generation
- Logout with token blacklisting in Redis
- Address creation, default-address selection, and address deletion
- Protected routes using middleware

### Product catalog
- Create, read, update, and delete products
- Seller-only create/update/delete workflows
- Product image upload support via ImageKit
- Search and price-based filtering
- Seller-specific product listing

### Shopping cart
- Add items to cart
- Update quantities
- Delete items
- Clear cart
- User-scoped cart persistence

### Orders
- Create an order from the current cart
- Retrieve orders for the current user
- Fetch a single order by ID
- Cancel pending orders
- Update the shipping address before fulfillment

### Payments
- Create Razorpay order payloads for checkout
- Verify payment signatures
- Publish payment success/failure events for notifications

### Notifications
- Welcome emails on registration
- Payment success and failure emails through queue-driven handlers

### AI assistant
- Product search through the assistant
- Add products to the cart from natural language prompts
- Tool-based workflow using LangGraph and LangChain

### Seller dashboard
- View seller products
- Review seller-related orders
- See sales and revenue metrics

## How the project is coded

Each service uses a consistent internal pattern:

- server.js: entry point for starting the service
- src/app.js: Express application wiring and route registration
- src/routes: route definitions
- src/controllers: API logic
- src/middleware: authentication and validation flows
- src/model or src/models: database schemas using Mongoose
- src/db: database connection setup
- src/broker: RabbitMQ publisher/consumer helpers
- tests: service-level test coverage where available

## Technology stack

- Node.js
- Express.js
- MongoDB + Mongoose
- Redis
- RabbitMQ
- JWT
- Razorpay
- ImageKit
- Socket.IO
- LangChain / LangGraph
- Jest + Supertest

## Service ports

- Auth service: 3000
- Product service: 3001
- Cart service: 3002
- Order service: 3003
- Payment service: 3004
- AI Buddy service: 3005
- Notification service: 3006
- Seller Dashboard service: 3007

## Prerequisites

Install the following before running the platform locally:

- Node.js 18+
- MongoDB
- Redis
- RabbitMQ
- A Razorpay account for payment testing
- An ImageKit account for image hosting
- A Google Gemini API key for the AI assistant

## Environment variables

Create a .env file in each service directory with the variables required by that service. Typical values include:

- PORT
- MONGO_URI
- JWT_SECRET
- RABBIT_URL
- REDIS_URL or host configuration
- RAZORPAY_KEY_ID
- RAZORPAY_KEY_SECRET
- IMAGEKIT_PUBLIC_KEY
- IMAGEKIT_PRIVATE_KEY
- IMAGEKIT_URL_ENDPOINT
- GOOGLE_API_KEY

## Running locally

1. Install dependencies for each service:
   - cd auth && npm install
   - cd product && npm install
   - cd cart && npm install
   - cd order && npm install
   - cd payment && npm install
   - cd notification && npm install
   - cd ai-buddy && npm install
   - cd seller-dashboard && npm install

2. Start MongoDB, Redis, and RabbitMQ.

3. Start the services in separate terminals:
   - cd auth && npm start
   - cd product && npm start
   - cd cart && npm start
   - cd order && npm start
   - cd payment && npm start
   - cd notification && npm start
   - cd ai-buddy && npm start
   - cd seller-dashboard && npm start

## Example API flow

1. A user registers or logs in through the auth service.
2. The user browses products from the product service.
3. The user adds items to the cart.
4. The order service creates an order from the cart contents.
5. The payment service initiates Razorpay checkout.
6. The payment service verifies the transaction and publishes a notification event.
7. The notification service sends success or failure emails.

## Testing

The repository currently includes Jest-based tests for auth, product, order, and cart flows. Run tests per service with:

- npm test

## Summary

This repository demonstrates a practical microservices e-commerce backend with asynchronous communication, authentication, payments, and AI-assisted shopping workflows.

## Overview

The platform is organized into independent services so each domain can evolve separately:

- Auth service: user registration, login, JWT-based authentication, logout, and address management
- Product service: product CRUD, image uploads, seller-based access, and search/filtering
- Cart service: persistent user cart operations
- Order service: order creation from the cart, order history, cancellation, and shipping address updates
- Payment service: Razorpay-based payment initiation and verification
- Notification service: email notifications driven by RabbitMQ events
- AI Buddy service: conversational shopping assistant using LangGraph and tool-based product search/cart actions
- Seller Dashboard service: seller metrics, product listings, and order views

## Architecture

The system follows a service-oriented architecture:

- Express.js handles HTTP APIs in each service
- Mongoose connects each service to MongoDB
- RabbitMQ passes asynchronous events across services
- Redis stores token blacklist data in the auth workflow
- JWT secures authenticated routes
- Razorpay powers payment processing
- ImageKit stores and serves product images
- Socket.IO is used by the AI buddy service for real-time interaction capabilities

## Core Features

### Authentication and User Management
- User registration with role support for user and seller
- Login with JWT token generation
- Logout with token blacklisting in Redis
- Address creation, default-address selection, and address deletion
- Protected routes using middleware

### Product Catalog
- Create, read, update, and delete products
- Seller-only create/update/delete workflows
- Product image upload support via ImageKit
- Search and price-based filtering
- Seller-specific product listing

### Shopping Cart
- Add items to cart
- Update quantities
- Delete items
- Clear cart
- User-scoped cart persistence

### Orders
- Create an order from the current cart
- Retrieve orders for the current user
- Fetch a single order by ID
- Cancel pending orders
- Update the shipping address before fulfillment

### Payments
- Create Razorpay order payloads for checkout
- Verify payment signatures
- Publish payment success/failure events for notifications

### Notifications
- Welcome emails on registration
- Payment success and failure emails through queue-driven handlers

### AI Assistant
- Product search through the assistant
- Add products to the cart from natural language prompts
- Tool-based workflow using LangGraph and LangChain

### Seller Dashboard
- View seller products
- Review seller-related orders
- See sales and revenue metrics

## How the Project Is Coded

Each service follows a consistent internal structure:

- server.js: entry point for starting the service
- src/app.js: Express application wiring and route registration
- src/routes: route definitions
- src/controllers: API logic
- src/middleware: authentication and validation flows
- src/model or src/models: database schemas using Mongoose
- src/db: database connection setup
- src/broker: RabbitMQ publisher/consumer helpers
- tests: service-level test coverage where available

This design keeps business logic isolated by domain and makes each service easier to test and deploy independently.

## Technology Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- Redis
- RabbitMQ
- JWT
- Razorpay
- ImageKit
- Socket.IO
- LangChain / LangGraph
- Jest + Supertest

## Service Ports

- Auth service: 3000
- Product service: 3001
- Cart service: 3002
- Order service: 3003
- Payment service: 3004
- AI Buddy service: 3005
- Notification service: 3006
- Seller Dashboard service: 3007

## Prerequisites

Install the following before running the platform locally:

- Node.js 18+
- MongoDB
- Redis
- RabbitMQ
- A Razorpay account for payment testing
- An ImageKit account for image hosting
- A Google Gemini API key for the AI assistant

## Environment Variables

Create a .env file in each service directory with the variables required by that service. Typical values include:

- PORT
- MONGO_URI
- JWT_SECRET
- RABBIT_URL
- REDIS_URL or host configuration
- RAZORPAY_KEY_ID
- RAZORPAY_KEY_SECRET
- IMAGEKIT_PUBLIC_KEY
- IMAGEKIT_PRIVATE_KEY
- IMAGEKIT_URL_ENDPOINT
- GOOGLE_API_KEY

## Running Locally

1. Install dependencies for each service:
   - cd auth && npm install
   - cd product && npm install
   - cd cart && npm install
   - cd order && npm install
   - cd payment && npm install
   - cd notification && npm install
   - cd ai-buddy && npm install
   - cd seller-dashboard && npm install

2. Start MongoDB, Redis, and RabbitMQ.

3. Start the services in separate terminals:
   - cd auth && npm start
   - cd product && npm start
   - cd cart && npm start
   - cd order && npm start
   - cd payment && npm start
   - cd notification && npm start
   - cd ai-buddy && npm start
   - cd seller-dashboard && npm start

## Example API Flow

1. A user registers or logs in through the auth service.
2. The user browses products from the product service.
3. The user adds items to the cart.
4. The order service creates an order from the cart contents.
5. The payment service initiates Razorpay checkout.
6. The payment service verifies the transaction and publishes a notification event.
7. The notification service sends success or failure emails.

## Testing

The repository currently includes Jest-based tests for auth, product, order, and cart flows. Run tests per service with:

- npm test

## Notes

Some services are still evolving and some endpoints are wired to production-style hostnames. In a local development environment, adjust the base URLs in the services to point to your local gateways or service hosts as needed.

## Future Improvements

- Add API gateway routing
- Introduce Docker Compose for local orchestration
- Add end-to-end tests
- Harden validation and error handling
- Add inventory management and order status workflows
- Expand seller dashboard analytics
