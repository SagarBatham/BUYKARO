# Seller Dashboard Service

The Seller Dashboard service provides sellers with comprehensive visibility into their products, orders, and revenue metrics. All endpoints require JWT authentication.

## Features
- View all seller's products with creation timestamps
- Review all orders containing seller's products with customer details
- Access sales and revenue metrics (total revenue, number of sales)
- View top-performing products by sales volume
- Real-time dashboard data from MongoDB
- JWT token-based authentication for all endpoints
- MongoDB persistence with seller filtering

## How it is coded
- server.js boots the service on port 3007
- src/app.js wires the router and connects to MongoDB and RabbitMQ
- src/routes/seller.route.js exposes dashboard endpoints under /api/seller/dashboard
- src/controllers/seller.controller.js contains the business logic:
  - `getMetrics()` - Calculates revenue and sales from confirmed/shipped/delivered orders
  - `getOrders()` - Retrieves all orders containing seller's products
  - `getProducts()` - Lists all products created by seller
- src/models/product.model.js - Product schema with seller reference
- src/models/order.model.js - Order schema with items and pricing
- src/middleware/auth.middleware.js - JWT validation and user identification

## Service Port
- **Port:** 3007
- **Access:** http://localhost:3007

## Environment variables
```bash
# MongoDB Connection
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/buykaro

# JWT Secret for token validation
JWT_SECRET=your-jwt-secret-key

# RabbitMQ URL (optional)
RABBIT_URL=amqp://username:password@rabbitmq-host:5672
```

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <jwt-token>
```

## Main endpoints

### Get Dashboard Metrics
Returns aggregated sales data and top products for the seller.

```http
GET /api/seller/dashboard/metrics
Authorization: Bearer <jwt-token>
```

**Response (200 OK):**
```json
{
  "sales": 15,
  "revenue": 125750,
  "topProducts": [
    {
      "productId": "507f1f77bcf86cd799439011",
      "title": "Premium Headphones",
      "sales": 8,
      "totalRevenue": 79992
    },
    {
      "productId": "507f1f77bcf86cd799439012",
      "title": "Wireless Charger",
      "sales": 7,
      "totalRevenue": 45758
    }
  ]
}
```

**Metrics Calculation:**
- `sales`: Count of items sold from orders with status CONFIRMED, SHIPPED, or DELIVERED
- `revenue`: Sum of item prices for completed orders
- `topProducts`: Products sorted by number of sales (descending)

### Get Seller Orders
Returns all orders that contain at least one of the seller's products.

```http
GET /api/seller/dashboard/orders
Authorization: Bearer <jwt-token>
```

**Response (200 OK):**
```json
{
  "orders": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "customer": "John Doe",
      "status": "DELIVERED",
      "totalAmount": 45999,
      "currency": "INR",
      "createdAt": "2024-01-15T10:30:00Z",
      "items": [
        {
          "product": "507f1f77bcf86cd799439011",
          "quantity": 2,
          "price": {
            "amount": 9999,
            "currency": "INR"
          }
        }
      ]
    },
    {
      "_id": "507f1f77bcf86cd799439014",
      "customer": "jane.doe@example.com",
      "status": "SHIPPED",
      "totalAmount": 79992,
      "currency": "INR",
      "createdAt": "2024-01-14T14:20:00Z",
      "items": [
        {
          "product": "507f1f77bcf86cd799439012",
          "quantity": 1,
          "price": {
            "amount": 79992,
            "currency": "INR"
          }
        }
      ]
    }
  ]
}
```

**Order Status Values:**
- `CONFIRMED` - Order confirmed and payment received
- `SHIPPED` - Order shipped to customer
- `DELIVERED` - Order delivered to customer
- `CANCELLED` - Order cancelled by customer or seller

### Get Seller Products
Returns all products created/listed by the seller.

```http
GET /api/seller/dashboard/products
Authorization: Bearer <jwt-token>
```

**Response (200 OK):**
```json
{
  "products": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Premium Headphones",
      "description": "High-quality wireless headphones with noise cancellation",
      "price": {
        "amount": 9999,
        "currency": "INR"
      },
      "category": "Electronics",
      "stock": 25,
      "seller": "507f1f77bcf86cd799439001",
      "image": "https://imagekit.io/buykaro/headphones-1.jpg",
      "createdAt": "2024-01-10T08:15:00Z",
      "updatedAt": "2024-01-15T12:00:00Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Wireless Charger",
      "description": "Fast wireless charging pad",
      "price": {
        "amount": 1299,
        "currency": "INR"
      },
      "category": "Electronics",
      "stock": 50,
      "seller": "507f1f77bcf86cd799439001",
      "image": "https://imagekit.io/buykaro/charger-1.jpg",
      "createdAt": "2024-01-12T16:45:00Z",
      "updatedAt": "2024-01-14T11:30:00Z"
    }
  ]
}
```

## Error Responses

### 400 Bad Request - Missing Seller Information
```json
{
  "message": "Seller information missing"
}
```

### 401 Unauthorized - Invalid Token
```json
{
  "message": "Invalid or expired token"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal Server Error"
}
```

## Database Collections

### Products Collection
Stores seller's products with price information and metadata.

### Orders Collection
Stores all orders with:
- Order items with product references
- Customer information
- Order status and timestamps
- Total price information

## Run locally
```bash
cd seller-dashboard
npm install
npm run dev
```

Service will start on port 3007 and connect to MongoDB for data persistence.
