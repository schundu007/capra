import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

// Initialize Stripe client
export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    })
  : null;

// Price IDs from Stripe Dashboard
export const STRIPE_PRICES = {
  MONTHLY: process.env.STRIPE_PRICE_MONTHLY,
  QUARTERLY_PRO: process.env.STRIPE_PRICE_QUARTERLY_PRO, // $300/quarter with jobs
  DESKTOP_LIFETIME: process.env.STRIPE_PRICE_DESKTOP,    // $300 one-time
  ADDON: process.env.STRIPE_PRICE_ADDON,                 // $30 for 3 credits
};

// Credits per plan
export const CREDITS_PER_PLAN = {
  monthly: 5,
  quarterly_pro: 10,
  desktop_lifetime: 0, // Desktop users use own keys
  addon: 3,
};

/**
 * Check if Stripe is configured
 */
export function isStripeConfigured() {
  return !!(stripeSecretKey && STRIPE_PRICES.QUARTERLY_PRO);
}

export default stripe;
