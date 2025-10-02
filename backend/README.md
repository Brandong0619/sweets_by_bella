# Sweets by Bella Backend

Express.js backend for handling Stripe payments and webhooks.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Update the `.env` file with your Stripe keys:

```env
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 3. Get Webhook Secret from Stripe

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. Set **Endpoint URL**: `http://localhost:3001/webhook`
4. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
5. Click **"Add endpoint"**
6. Copy the **"Signing secret"** and update your `.env` file

### 4. Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:3001`

## API Endpoints

- `GET /` - Health check
- `POST /create-checkout-session` - Create Stripe checkout session
- `POST /webhook` - Stripe webhook handler
- `GET /session/:sessionId` - Get session details
- `GET /health` - Server health check

## Testing

1. Start the backend server
2. Start the frontend (`npm run dev`)
3. Add items to cart and proceed to checkout
4. Use Stripe test card: `4242 4242 4242 4242`

## Production Deployment

For production, you'll need to:

1. Update webhook URL to your production domain
2. Use live Stripe keys
3. Deploy to a service like Railway, Heroku, or Vercel
4. Update frontend to use production backend URL
