# Notification Service

The notification service sends email notifications for key events in the BuyKaro platform using RabbitMQ message queue and Gmail SMTP.

## Features
- Welcome emails for newly registered users
- Payment success notification emails
- Payment failure notification emails
- Asynchronous event-driven email delivery
- Gmail OAuth2 authentication

## How it is coded
- server.js starts the HTTP endpoint on port 3006
- src/app.js initializes RabbitMQ subscriptions
- src/broker/listener.js listens to message queues and dispatches emails:
  - `AUTH_NOTIFICATION.USER_CREATED` - Sends welcome email when user registers
  - `PAYMENT_NOTIFICATION.PAYMENT_COMPLETED` - Sends payment success notification
- src/email.js handles email sending using Nodemailer with Gmail OAuth2
- src/broker/broker.js manages RabbitMQ connection and subscriptions
- RabbitMQ events drive the workflow asynchronously

## Main endpoints
- GET / - Health check endpoint

## Environment variables
```bash
RABBIT_URL=amqp://username:password@rabbitmq-host:5672

# Gmail SMTP Configuration (OAuth2)
EMAIL_USER=your-email@gmail.com
CLIENT_ID=your-google-client-id
CLIENT_SECRET=your-google-client-secret
REFRESH_TOKEN=your-google-refresh-token
```

### Setting up Gmail OAuth2:
1. Create a Google Cloud project and enable Gmail API
2. Create OAuth2 credentials (Service Account or Desktop App)
3. Generate refresh token using Google OAuth2 playground
4. Add credentials to environment variables

## Email Events from RabbitMQ

### User Registration - Welcome Email
**Event:** `AUTH_NOTIFICATION.USER_CREATED`
```json
{
  "email": "user@example.com",
  "fullName": {
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### Payment Completed - Success Notification
**Event:** `PAYMENT_NOTIFICATION.PAYMENT_COMPLETED`
```json
{
  "email": "user@example.com",
  "orderId": "order-id-123",
  "amount": 5000,
  "currency": "INR",
  "paymentId": "payment-id-123"
}
```

## API Endpoints

### Health Check
```http
GET /
```

**Response:**
```json
{
  "status": "ok",
  "service": "notification"
}
```

## Database
This service does NOT use MongoDB. It only sends emails via RabbitMQ events and Gmail SMTP.

## Service Port
- **Port:** 3006
- **Access:** http://localhost:3006

## Testing Email Sending
To test email configuration:
```javascript
const {sendEmail} = require('./src/email');
await sendEmail(
  'test@example.com',
  'Test Subject',
  'Plain text body',
  '<h1>HTML body</h1>'
);
```

## Run locally
```bash
cd notification
npm install
npm start
```

Service will start on port 3006 and begin listening to RabbitMQ message queues.
