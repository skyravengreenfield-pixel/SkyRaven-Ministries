# SkyRaven Ministries API Server

Backend server for handling Stripe payments and other API operations.

## Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` and add your Stripe keys:
```env
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
FRONTEND_URL=http://localhost:5173
```

### 3. Get Stripe Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Copy your **Secret key** (starts with `sk_test_` or `sk_live_`)
3. For webhooks:
   - Go to Developers > Webhooks
   - Add endpoint: `http://localhost:3000/api/webhooks/stripe`
   - Copy the webhook signing secret

### 4. Start Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Server will run at `http://localhost:3000`

## API Endpoints

### Health Check
```
GET /api/health
```

### Create Payment Intent
```
POST /api/payments/create-intent
Body: {
  amount: 50.00,
  donorName: "John Doe",
  donorEmail: "john@example.com",
  projectId: 1,
  message: "Optional message"
}
```

### Create Customer
```
POST /api/payments/create-customer
Body: {
  email: "john@example.com",
  name: "John Doe"
}
```

### Create Subscription
```
POST /api/payments/create-subscription
Body: {
  customerId: "cus_xxx",
  priceId: "price_xxx",
  paymentMethodId: "pm_xxx"
}
```

### Cancel Subscription
```
POST /api/payments/cancel-subscription/:subscriptionId
```

### Retrieve Payment Intent
```
GET /api/payments/intent/:paymentIntentId
```

### Webhook Handler
```
POST /api/webhooks/stripe
(Handles Stripe webhook events)
```

## Testing

Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

Test with cURL:
```bash
curl -X POST http://localhost:3000/api/payments/create-intent \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50.00,
    "donorName": "Test User",
    "donorEmail": "test@example.com"
  }'
```

## Security Features

- Helmet.js for security headers
- CORS configured for frontend
- Rate limiting (100 requests per 15 minutes)
- Webhook signature verification
- Input validation

## Production Deployment

1. Set `NODE_ENV=production`
2. Use live Stripe keys (starting with `sk_live_`)
3. Update `FRONTEND_URL` to your production domain
4. Set up SSL/HTTPS
5. Configure webhook endpoint with production URL

## Troubleshooting

**Server won't start:**
- Check if port 3000 is available
- Verify `.env` file exists

**Payment fails:**
- Check Stripe dashboard logs
- Verify secret key is correct
- Check network errors in browser console

**Webhook not receiving events:**
- Verify webhook secret is correct
- Check webhook URL is accessible
- Review Stripe webhook logs
