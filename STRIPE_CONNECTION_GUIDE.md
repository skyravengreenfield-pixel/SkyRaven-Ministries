# 🚀 Connect Your Stripe Account - Complete Guide

## Step-by-Step Instructions

### Step 1: Get Your Stripe API Keys

1. **Go to Stripe Dashboard**
   - Visit: https://dashboard.stripe.com/

2. **Sign Up or Log In**
   - Create a free account if you don't have one
   - No credit card required for testing

3. **Get Your API Keys**
   - Click **Developers** in the left menu
   - Click **API keys**
   - You'll see two keys:
     - **Publishable key** (starts with `pk_test_`) - Safe to use in frontend
     - **Secret key** (starts with `sk_test_`) - MUST stay on backend only

4. **Copy Your Keys**
   - Click "Reveal test key" for the Secret key
   - Copy both keys somewhere safe

### Step 2: Configure Frontend

1. **Add Publishable Key to Frontend**
   ```bash
   # In project root
   cp .env.example .env.local
   ```

2. **Edit `.env.local`** and add:
   ```env
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
   ```

### Step 3: Set Up Backend Server

1. **Install Backend Dependencies**
   ```bash
   cd server
   npm install
   ```

2. **Configure Backend Environment**
   ```bash
   # In server directory
   cp .env.example .env
   ```

3. **Edit `server/.env`** and add:
   ```env
   PORT=3000
   NODE_ENV=development
   STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
   FRONTEND_URL=http://localhost:5173
   ```

### Step 4: Start the Backend Server

```bash
# From server directory
npm run dev
```

You should see:
```
🚀 Server running on port 3000
📍 API available at http://localhost:3000/api
🔥 Environment: development
```

### Step 5: Test the Connection

1. **Start the frontend** (in another terminal):
   ```bash
   # From project root
   npm run dev
   ```

2. **Test API Connection**:
   ```bash
   curl http://localhost:3000/api/health
   ```
   
   Should return: `{"status":"ok","message":"Server is running"}`

3. **Test Payment Intent Creation**:
   ```bash
   curl -X POST http://localhost:3000/api/payments/create-intent \
     -H "Content-Type: application/json" \
     -d '{
       "amount": 50.00,
       "donorName": "Test User",
       "donorEmail": "test@example.com"
     }'
   ```

### Step 6: Set Up Webhooks (Optional but Recommended)

Webhooks let Stripe notify your server about payment events.

1. **Go to Stripe Dashboard > Developers > Webhooks**

2. **Add Endpoint**:
   - Click "Add endpoint"
   - URL: `http://localhost:3000/api/webhooks/stripe`
   - Events to listen for:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`

3. **Get Webhook Secret**:
   - After creating, click on the webhook
   - Click "Reveal" under "Signing secret"
   - Copy the secret (starts with `whsec_`)

4. **Add to `server/.env`**:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
   ```

5. **Restart Server** to apply changes

### Step 7: Test a Real Payment

1. **In your app, navigate to the donation page**

2. **Use a test card**:
   - Card number: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/34)
   - CVC: Any 3 digits (e.g., 123)
   - ZIP: Any 5 digits (e.g., 12345)

3. **Submit the payment**

4. **Check Stripe Dashboard**:
   - Go to Payments in Stripe Dashboard
   - You should see your test payment!

## 🎯 Quick Verification Checklist

- [ ] Stripe account created
- [ ] Publishable key in `.env.local`
- [ ] Secret key in `server/.env`
- [ ] Backend server running on port 3000
- [ ] Frontend running on port 5173
- [ ] Health check returns OK
- [ ] Test payment successful

## 📝 Your Configuration Summary

**Frontend (`.env.local`):**
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
```

**Backend (`server/.env`):**
```env
PORT=3000
STRIPE_SECRET_KEY=sk_test_YOUR_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET
FRONTEND_URL=http://localhost:5173
```

## 🧪 Test Cards

| Scenario | Card Number | Result |
|----------|-------------|--------|
| Success | 4242 4242 4242 4242 | Payment succeeds |
| Decline | 4000 0000 0000 0002 | Card declined |
| Insufficient funds | 4000 0000 0000 9995 | Insufficient funds |
| 3D Secure | 4000 0025 0000 3155 | Requires authentication |

## 🚨 Common Issues

**"Stripe is not initialized"**
- Make sure `VITE_STRIPE_PUBLISHABLE_KEY` is set in `.env.local`
- Restart frontend after adding env vars

**"Failed to create payment intent"**
- Check backend server is running
- Verify `STRIPE_SECRET_KEY` in `server/.env`
- Check browser console for network errors

**"CORS error"**
- Verify `FRONTEND_URL` matches in `server/.env`
- Restart backend after changing env vars

**Webhook not receiving events**
- For local testing, use Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- Or use a service like ngrok to expose your local server

## 🎉 You're Connected!

Once everything is working:
1. Payments are processed through Stripe
2. You can see transactions in Stripe Dashboard
3. Test with various scenarios
4. Ready for production when you switch to live keys

## 📚 Next Steps

1. **Customize Payment Flow**: Add custom fields, amounts, recurring options
2. **Add Receipt Emails**: Configure in Stripe Dashboard > Settings > Emails
3. **Set Up Tax Collection**: If applicable in your region
4. **Enable More Payment Methods**: Cards, bank transfers, digital wallets
5. **Go Live**: Switch to live keys and enable real payments

## 🆘 Need Help?

- Stripe Documentation: https://stripe.com/docs
- Stripe Support: https://support.stripe.com
- API Reference: https://stripe.com/docs/api

---

**Your Stripe integration is ready to accept donations! 💳✨**
