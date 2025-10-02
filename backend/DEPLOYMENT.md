# Vercel Deployment Guide

## Step 1: Deploy to Vercel

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign up/Login with GitHub**
3. **Click "New Project"**
4. **Import your GitHub repository**
5. **Set the Root Directory to `backend`**
6. **Click "Deploy"**

## Step 2: Configure Environment Variables

In your Vercel dashboard, go to **Settings** → **Environment Variables** and add:

```
STRIPE_SECRET_KEY = your_stripe_secret_key_here
FRONTEND_URL = https://your-frontend-domain.vercel.app
```

## Step 3: Get Your Backend URL

After deployment, Vercel will give you a URL like:
`https://sweets-by-bella-backend-abc123.vercel.app`

## Step 4: Set Up Stripe Webhook

1. **Go to [Stripe Dashboard](https://dashboard.stripe.com)**
2. **Click "Developers" → "Webhooks"**
3. **Click "Add endpoint"**
4. **Set Endpoint URL**: `https://your-backend-url.vercel.app/webhook`
5. **Select events**:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
6. **Click "Add endpoint"**
7. **Copy the "Signing secret"**

## Step 5: Update Environment Variables

Add the webhook secret to Vercel:

```
STRIPE_WEBHOOK_SECRET = whsec_your_webhook_secret_here
```

## Step 6: Update Frontend

Update your frontend to use the Vercel backend URL instead of localhost.

## Step 7: Deploy Frontend

Deploy your frontend to Vercel as well, then update the backend's FRONTEND_URL environment variable.
