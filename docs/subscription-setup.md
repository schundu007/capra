# Subscription & Credit System Setup Guide

This guide walks you through setting up the OAuth, Stripe payments, and credit system for Ascend.

## Overview

| Component | Service | Purpose |
|-----------|---------|---------|
| Auth | Supabase | Google, GitHub, LinkedIn OAuth |
| Database | Supabase PostgreSQL | User profiles, credits, company preps |
| Payments | Stripe | Subscriptions & one-time purchases |
| Backend | Railway | Express.js API |
| Frontend | Vercel | React webapp |

## Pricing

| Plan | Price | Credits |
|------|-------|---------|
| Interview Ready (monthly) | $29/month | 5 credits |
| FAANG Track (quarterly_pro) | $59/month | 10 credits |
| Elite (desktop_lifetime) | $99/month | — (desktop app) |
| Add-on | $30 one-time | 3 credits |

**Credit Rules:**
- 1 credit = 1 company interview preparation
- First company is FREE (no credit needed)
- Additional companies require 1 credit each

---

## Step 1: Supabase Setup

### 1.1 Create Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and API keys from Settings > API

### 1.2 Run Database Schema

1. Open the SQL Editor in Supabase Dashboard
2. Copy contents from `supabase/schema.sql`
3. Run the SQL to create tables, RLS policies, and triggers

### 1.3 Configure OAuth Providers

Go to **Authentication > Providers** and enable:

**Google:**
1. Create OAuth credentials at [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
3. Enter Client ID and Secret in Supabase

**GitHub:**
1. Create OAuth App at [GitHub Developer Settings](https://github.com/settings/developers)
2. Add callback URL: `https://your-project.supabase.co/auth/v1/callback`
3. Enter Client ID and Secret in Supabase

**LinkedIn:**
1. Create app at [LinkedIn Developer Portal](https://www.linkedin.com/developers/apps)
2. Add OAuth 2.0 redirect URL: `https://your-project.supabase.co/auth/v1/callback`
3. Enter Client ID and Secret in Supabase
4. Note: Use `linkedin_oidc` as the provider name in code

### 1.4 Configure Auth Settings

In **Authentication > URL Configuration**:
- Site URL: `https://your-frontend-domain.vercel.app`
- Redirect URLs: Add `https://your-frontend-domain.vercel.app/auth/callback`

---

## Step 2: Stripe Setup

### 2.1 Create Stripe Account

1. Go to [stripe.com](https://stripe.com)
2. Create or sign into your account
3. Get your API keys from Developers > API keys

### 2.2 Create Products & Prices

In **Products**, create three products:

**Interview Ready (Monthly):**
- Name: "Ascend Interview Ready"
- Pricing: $29/month recurring
- Copy the Price ID (starts with `price_`)

**FAANG Track (Quarterly Pro):**
- Name: "Ascend FAANG Track"
- Pricing: $59/month recurring
- Copy the Price ID

**Elite (Desktop Lifetime):**
- Name: "Ascend Elite"
- Pricing: $99/month recurring
- Copy the Price ID

**Credit Add-on:**
- Name: "Credit Add-on (3 Credits)"
- Pricing: $30 one-time
- Copy the Price ID

### 2.3 Configure Webhook

1. Go to **Developers > Webhooks**
2. Add endpoint: `https://your-backend.up.railway.app/api/billing/webhook`
3. Select events:
   - `checkout.session.completed`
   - `invoice.paid`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the Webhook Secret (starts with `whsec_`)

### 2.4 Configure Customer Portal

1. Go to **Settings > Billing > Customer portal**
2. Enable the portal
3. Configure allowed actions (update payment method, cancel subscription, etc.)

---

## Step 3: Backend Configuration (Railway)

Add these environment variables in Railway dashboard:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_ANON_KEY=eyJ...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_MONTHLY=price_xxx
STRIPE_PRICE_QUARTERLY=price_xxx
STRIPE_PRICE_ADDON=price_xxx
```

Then redeploy the backend.

---

## Step 4: Frontend Configuration (Vercel)

Add these environment variables in Vercel dashboard:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

Then redeploy the frontend.

---

## Step 5: Testing

### Test OAuth Login

1. Visit your webapp
2. Click "Continue with Google" (or GitHub/LinkedIn)
3. Verify you're redirected back and logged in
4. Check Supabase Authentication > Users to see the new user

### Test Free Tier

1. Create a new company prep
2. Verify no credit is deducted (first one is free)
3. Check credits balance shows "Free tier available"

### Test Subscription

1. Go to pricing page
2. Click "Subscribe Now" on Monthly plan
3. Use Stripe test card: `4242 4242 4242 4242`
4. Verify webhook fires and credits are added

### Test Credit Usage

1. Create a second company prep
2. Verify 1 credit is deducted
3. Check credit balance decreased

### Test Add-on Purchase

1. Click "Buy Credits" on pricing page
2. Complete checkout
3. Verify 5 credits are added to balance

---

## Webhook Events Reference

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Creates/updates subscription, adds credits for add-ons |
| `invoice.paid` | Adds 5 credits for subscription renewal |
| `customer.subscription.updated` | Updates subscription status and plan type |
| `customer.subscription.deleted` | Marks subscription as canceled |

---

## Troubleshooting

### OAuth not working
- Check redirect URLs match exactly in Supabase and provider settings
- Verify provider credentials are correct
- Check browser console for errors

### Webhook not firing
- Verify webhook URL is correct
- Check Railway logs for errors
- Use Stripe CLI for local testing: `stripe listen --forward-to localhost:3001/api/billing/webhook`

### Credits not adding
- Check webhook events in Stripe Dashboard
- Verify `stripe_events` table for processed events
- Check backend logs for errors

### User not created on signup
- Verify `handle_new_user` trigger exists in Supabase
- Check Supabase logs for trigger errors

---

## Security Notes

1. **Service Role Key**: Only use on backend, never expose to frontend
2. **Webhook Secret**: Validates webhook signatures, keep secret
3. **RLS Policies**: Users can only access their own data
4. **Idempotency**: `stripe_events` table prevents duplicate processing
