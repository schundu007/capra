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
  QUARTERLY: process.env.STRIPE_PRICE_QUARTERLY,
  ADDON: process.env.STRIPE_PRICE_ADDON,
};

// Credits per plan
export const CREDITS_PER_PLAN = {
  monthly: 5,
  quarterly: 15,
  addon: 5,
};

/**
 * Check if Stripe is configured
 */
export function isStripeConfigured() {
  return !!(stripeSecretKey && STRIPE_PRICES.MONTHLY && STRIPE_PRICES.QUARTERLY);
}

export default stripe;
