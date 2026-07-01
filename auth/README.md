# Auth Service

The auth service handles all account-related concerns for BuyKaro.

## Features
- User registration with role selection
- Login with JWT-based authentication
- Current-user retrieval
- Logout with Redis-based token blacklisting
- Address management for users
- Protected routes with middleware

## How it is coded
- The entry point is server.js
- src/app.js wires Express and mounts the auth routes
- src/routes/auth.js defines the public and protected endpoints
- src/controllers/auth.controller.js contains the authentication logic
- src/middleware/auth.middleware.js validates JWT tokens and user roles
- src/model/user.model.js defines the user and address schema using Mongoose
- src/db/db.js and src/db/redis.js manage MongoDB and Redis connections
- src/broker/broker.js publishes domain events such as user creation

## Main endpoints
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- GET /api/auth/logout
- GET /api/auth/users/me/addresses
- POST /api/auth/users/me/addresses
- POST /api/auth/users/me/addresses/:addressId/default
- DELETE /api/auth/users/me/addresses/:addressId

## Environment variables
- MONGO_URI
- JWT_SECRET
- RABBIT_URL
- REDIS_URL

## Run locally
```bash
cd auth
npm install
npm run dev
```
