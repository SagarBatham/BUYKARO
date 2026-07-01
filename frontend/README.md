# BuyKaro Frontend

A modern, full-featured e-commerce frontend built with **Next.js 14**, **React 18**, **TypeScript**, and **TailwindCSS**. This frontend provides a complete shopping experience integrated with the BuyKaro microservices backend.

## Overview

The BuyKaro frontend is a production-ready e-commerce application that connects to the BuyKaro backend microservices. It provides a seamless shopping experience with product browsing, cart management, order processing, and an AI-powered shopping assistant.

### Key Features

- **🛍️ Product Browsing**: Browse products with advanced filtering and search
- **🛒 Shopping Cart**: Real-time cart management with local persistence
- **💳 Checkout & Payment**: Seamless checkout with Razorpay integration
- **📦 Order Management**: Track orders and view order history
- **🤖 AI Shopping Assistant**: Real-time chat with LLM-powered shopping assistant (Socket.IO)
- **👤 User Authentication**: Secure JWT-based authentication
- **🏪 Seller Dashboard**: Comprehensive dashboard for sellers to manage products and orders
- **📱 Responsive Design**: Fully responsive mobile-first design
- **🎨 Modern UI**: Clean and intuitive interface with TailwindCSS

## Technology Stack

### Frontend Framework & Tools
- **Next.js 14** - React framework with App Router (SSR/SSG)
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **TailwindCSS** - Utility-first CSS framework
- **React Hook Form** - Efficient form management
- **Zod** - Runtime type validation

### State Management & API
- **Zustand** - Lightweight state management (Auth & Cart)
- **Axios** - HTTP client for API calls
- **Socket.IO** - Real-time bidirectional communication

### Authentication & Security
- **JWT Tokens** - Secure authentication
- **Cookies** - Secure token storage
- **NextAuth** - Authentication middleware (optional)

### Additional Libraries
- **Lucide React** - Beautiful SVG icons
- **Date-fns** - Date utilities
- **js-cookie** - Cookie management

## Project Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout
│   ├── globals.css              # Global styles
│   ├── page.tsx                 # Home page
│   ├── products/
│   │   ├── page.tsx             # Products listing
│   │   └── [id]/
│   │       └── page.tsx         # Product detail
│   ├── login/
│   │   └── page.tsx             # Login page
│   ├── register/
│   │   └── page.tsx             # Register page
│   ├── cart/
│   │   └── page.tsx             # Shopping cart
│   ├── checkout/
│   │   └── page.tsx             # Checkout page
│   ├── orders/
│   │   └── page.tsx             # Orders listing
│   ├── seller/
│   │   └── page.tsx             # Seller dashboard
│   └── ai-buddy/
│       └── page.tsx             # AI shopping assistant
│
├── components/                   # React components
│   ├── MainLayout.tsx           # Main layout wrapper
│   ├── Navbar.tsx               # Navigation bar
│   ├── Footer.tsx               # Footer component
│   ├── LoginForm.tsx            # Login form
│   ├── RegisterForm.tsx         # Registration form
│   ├── ProductGrid.tsx          # Product grid display
│   ├── ProductDetail.tsx        # Product detail view
│   ├── CartView.tsx             # Cart page component
│   ├── Checkout.tsx             # Checkout component
│   ├── OrdersList.tsx           # Orders listing
│   ├── SellerDashboard.tsx      # Seller dashboard
│   └── AIBuddyChat.tsx          # AI chat interface
│
├── lib/                          # Utilities and helpers
│   ├── api.ts                   # Axios instance with interceptors
│   └── apiServices.ts           # API service functions
│
├── store/                        # Zustand store
│   └── index.ts                 # Auth & Cart state management
│
├── hooks/                        # Custom React hooks
│   └── useAuth.ts               # Auth hook
│
├── types/                        # TypeScript types
│   └── index.ts                 # Shared types
│
├── styles/                       # Additional stylesheets
│   └── (empty for now)
│
├── public/                       # Static assets
│   └── (images, logos, etc.)
│
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
├── tailwind.config.js           # TailwindCSS config
├── postcss.config.js            # PostCSS config
├── next.config.js               # Next.js config
├── .env.example                 # Environment variables template
└── README.md                    # This file
```

## Getting Started

### Prerequisites
- **Node.js** 18.0+ 
- **npm** or **yarn**
- Backend services running (Auth, Product, Cart, Order, Payment services)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure environment variables** (edit `.env.local`):
   ```env
   # API Gateway or Load Balancer
   NEXT_PUBLIC_API_URL=http://buykaro-alb-786683605.ap-south-1.elb.amazonaws.com

   # Individual Service URLs (optional for direct calls)
   NEXT_PUBLIC_AUTH_SERVICE=http://localhost:3001
   NEXT_PUBLIC_PRODUCT_SERVICE=http://localhost:3002
   NEXT_PUBLIC_CART_SERVICE=http://localhost:3003
   NEXT_PUBLIC_ORDER_SERVICE=http://localhost:3004
   NEXT_PUBLIC_PAYMENT_SERVICE=http://localhost:3005

   # AI Buddy Socket.IO
   NEXT_PUBLIC_SOCKET_URL=http://localhost:3005
   NEXT_PUBLIC_SOCKET_PATH=/api/socket/socket.io/

   # Razorpay
   NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id

   # ImageKit
   NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/buykaro
   ```

5. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open in browser**
   ```
   http://localhost:3000
   ```

## Frontend Architecture & Data Flow

### 1. Authentication Flow

```
Login/Register Page
       ↓
   LoginForm/RegisterForm (React Hook Form + Zod validation)
       ↓
   Call authAPI.login() / authAPI.register()
       ↓
   Receive JWT token + User data
       ↓
   Store in Zustand (useAuthStore) + Cookie
       ↓
   Redirect to Home / Protected Pages
```

### 2. Product Browsing Flow

```
Products Page
       ↓
   ProductGrid Component
       ↓
   Fetch products from productAPI.getProducts(params)
       ↓
   Display filtered/searched products
       ↓
   User clicks product → ProductDetail Page
       ↓
   Fetch single product via productAPI.getProductById()
       ↓
   Display detailed view + Add to Cart button
```

### 3. Cart & Checkout Flow

```
Add to Cart
       ↓
   Store in Zustand (useCartStore) + LocalStorage
       ↓
   Navigate to /cart
       ↓
   CartView Component displays all items
       ↓
   User proceeds to checkout
       ↓
   Checkout Component
       ↓
   Fetch saved addresses via authAPI.getAddresses()
       ↓
   User selects address + confirms
       ↓
   Call orderAPI.createOrder()
       ↓
   Create order in backend
       ↓
   Redirect to /payment/{orderId}
       ↓
   Payment processing (Razorpay integration)
```

### 4. AI Buddy Chat Flow

```
AI Buddy Page (/ai-buddy)
       ↓
   AIBuddyChat Component initializes Socket.IO connection
       ↓
   JWT token from cookie passed to Socket.IO
       ↓
   User sends message via Socket.IO
       ↓
   Backend processes with LLM (Gemini 2.5 Flash)
       ↓
   LLM decides if tools are needed:
       - searchProduct tool → calls Product Service
       - addProductToCart tool → calls Cart Service
       ↓
   Response sent back via Socket.IO
       ↓
   Display assistant response in chat
```

### 5. Seller Dashboard Flow

```
Seller Dashboard (/seller)
       ↓
   SellerDashboard Component
       ↓
   Fetch metrics: sellerAPI.getMetrics()
   Fetch orders: sellerAPI.getOrders()
   Fetch products: sellerAPI.getProducts()
       ↓
   Display dashboard cards with KPIs
   Display recent orders table
   Display top-performing products
       ↓
   All data real-time from MongoDB
```

## API Integration

### API Endpoints Overview

The frontend integrates with these backend services:

#### Authentication Service (Port 3001)
```typescript
POST   /api/auth/register        # Register new user
POST   /api/auth/login           # User login
POST   /api/auth/logout          # User logout
GET    /api/auth/me              # Get current user
GET    /api/auth/addresses       # Get user addresses
POST   /api/auth/addresses       # Add address
PUT    /api/auth/addresses/:id   # Update address
DELETE /api/auth/addresses/:id   # Delete address
```

#### Product Service (Port 3002)
```typescript
GET    /api/products             # List products (with filters & search)
GET    /api/products/:id         # Get product by ID
POST   /api/products             # Create product (admin)
PUT    /api/products/:id         # Update product (admin)
DELETE /api/products/:id         # Delete product (admin)
```

#### Cart Service (Port 3003)
```typescript
GET    /api/cart                 # Get user cart
POST   /api/cart/items           # Add item to cart
PUT    /api/cart/items/:id       # Update cart item quantity
DELETE /api/cart/items/:id       # Remove item from cart
DELETE /api/cart                 # Clear entire cart
```

#### Order Service (Port 3004)
```typescript
POST   /api/orders               # Create order
GET    /api/orders/me            # Get user orders
GET    /api/orders/:id           # Get order by ID
POST   /api/orders/:id/cancel    # Cancel order
PATCH  /api/orders/:id/address   # Update shipping address
```

#### Payment Service (Port 3005)
```typescript
POST   /api/payments/razorpay/order    # Create Razorpay order
POST   /api/payments/razorpay/verify   # Verify payment
```

#### Seller Dashboard Service (Port 3007)
```typescript
GET    /api/seller/dashboard/metrics   # Get seller metrics
GET    /api/seller/dashboard/orders    # Get seller orders
GET    /api/seller/dashboard/products  # Get seller products
```

### Example API Usage

```typescript
// In components, use the API services:
import { productAPI, cartAPI, authAPI } from '@/lib/apiServices';

// Fetch products
const response = await productAPI.getProducts({ q: 'laptop' });

// Add to cart
await cartAPI.addItem('product-id', 2);

// Get current user
const user = await authAPI.getCurrentUser();
```

## State Management

### Using Zustand Stores

#### Authentication Store
```typescript
import { useAuthStore } from '@/store';

const { user, token, isAuthenticated, setUser, setToken, logout } = useAuthStore();
```

#### Cart Store
```typescript
import { useCartStore } from '@/store';

const { items, addItem, removeItem, updateQuantity, clearCart, getTotalPrice } = useCartStore();

// Add item
addItem({ productId: '123', title: 'Product', price: 1000, quantity: 1 });

// Get total
const total = getTotalPrice();
```

## Authentication & Authorization

### How Authentication Works

1. **User Registration**
   - User fills registration form
   - Form validates via Zod schema
   - Sent to `/api/auth/register`
   - Backend returns success/error

2. **User Login**
   - User enters credentials
   - Credentials sent to `/api/auth/login`
   - Backend returns JWT token + user data
   - Token stored in **secure HTTP-only cookie**
   - Token also in Zustand store for component access
   - User redirected to home page

3. **Protected Routes**
   - API calls include `Authorization: Bearer <token>` header
   - Interceptor in `lib/api.ts` automatically adds token to requests
   - If token expired (401), user redirected to login

### JWT Token Flow

```
axios interceptor
       ↓
Get token from cookie (js-cookie)
       ↓
Add to Authorization header
       ↓
Send request to backend
       ↓
Backend validates JWT
       ↓
If valid → Process request
If invalid → Return 401
       ↓
Frontend interceptor catches 401
       ↓
Clear cookies + redirect to /login
```

## Component Development Guide

### Creating a New Component

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store';

export function MyComponent() {
  const { user } = useAuthStore();
  const [data, setData] = useState(null);

  useEffect(() => {
    // Fetch data
  }, []);

  return (
    <div>
      {/* Component JSX */}
    </div>
  );
}
```

### Using Forms

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
    </form>
  );
}
```

## Deployment

### Build for Production

```bash
npm run build
npm start
```

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy with Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t buykaro-frontend .
docker run -p 3000:3000 buykaro-frontend
```

## Performance Optimization

- **Image Optimization**: Next.js Image component with ImageKit integration
- **Code Splitting**: Automatic by Next.js
- **Lazy Loading**: Components loaded on demand
- **Caching**: HTTP caching + browser caching
- **CSS**: TailwindCSS with PurgeCSS

## Testing

### Unit Tests
```bash
npm run test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

## Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Check `NEXT_PUBLIC_API_URL` in `.env.local`
   - Ensure backend services are running
   - Check CORS settings in backend

2. **Socket.IO Connection Failed**
   - Verify `NEXT_PUBLIC_SOCKET_URL` and `NEXT_PUBLIC_SOCKET_PATH`
   - Ensure AI Buddy service is running on port 3005
   - Check browser console for errors

3. **Authentication Issues**
   - Check JWT token in cookies (DevTools → Application → Cookies)
   - Verify token expiration
   - Check `JWT_SECRET` matches backend

4. **Styling Not Applied**
   - Run `npm run build` to regenerate CSS
   - Clear `.next` directory
   - Restart dev server

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit pull request

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Main API gateway URL | `http://localhost:3000` |
| `NEXT_PUBLIC_SOCKET_URL` | Socket.IO server URL | `http://localhost:3005` |
| `NEXT_PUBLIC_SOCKET_PATH` | Socket.IO path | `/api/socket/socket.io/` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay public key | `key_xxxxx` |
| `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` | ImageKit URL | `https://ik.imagekit.io/buykaro` |

## Support & Resources

- **Documentation**: See backend READMEs for API details
- **Issues**: Report bugs on GitHub
- **Architecture**: See project structure section above

## License

MIT License - see LICENSE file for details

---

**Built with ❤️ for BuyKaro E-commerce Platform**
