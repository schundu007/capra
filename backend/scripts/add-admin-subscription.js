#!/usr/bin/env node
/**
 * Admin script to add subscription for a user
 * Usage: node scripts/add-admin-subscription.js <email>
 */

import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function addSubscription(email) {
  const client = await pool.connect();

  try {
    // Find user by email
    const userResult = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      console.error(`User not found: ${email}`);
      process.exit(1);
    }

    const userId = userResult.rows[0].id;
    console.log(`Found user ID: ${userId}`);

    // Check if subscription exists
    const subResult = await client.query(
      'SELECT * FROM ascend_subscriptions WHERE user_id = $1',
      [userId]
    );

    if (subResult.rows.length > 0) {
      // Update existing subscription
      await client.query(
        `UPDATE ascend_subscriptions
         SET plan_type = 'quarterly_pro', status = 'active', updated_at = NOW()
         WHERE user_id = $1`,
        [userId]
      );
      console.log('Updated existing subscription to quarterly_pro (active)');
    } else {
      // Insert new subscription
      await client.query(
        `INSERT INTO ascend_subscriptions (user_id, plan_type, status, created_at, updated_at)
         VALUES ($1, 'quarterly_pro', 'active', NOW(), NOW())`,
        [userId]
      );
      console.log('Created new quarterly_pro subscription');
    }

    // Also reset free usage limits to max
    await client.query(
      `INSERT INTO ascend_free_usage (user_id, coding_used, coding_limit, design_used, design_limit, company_prep_used, company_prep_limit)
       VALUES ($1, 0, 9999, 0, 9999, 0, 9999)
       ON CONFLICT (user_id) DO UPDATE SET
         coding_used = 0, coding_limit = 9999,
         design_used = 0, design_limit = 9999,
         company_prep_used = 0, company_prep_limit = 9999`,
      [userId]
    );
    console.log('Reset free usage limits to 9999');

    // Add 10000 credits
    await client.query(
      `INSERT INTO ascend_credits (user_id, balance, lifetime_earned)
       VALUES ($1, 10000, 10000)
       ON CONFLICT (user_id) DO UPDATE SET
         balance = ascend_credits.balance + 10000,
         lifetime_earned = ascend_credits.lifetime_earned + 10000`,
      [userId]
    );
    console.log('Added 10000 credits');

    console.log(`\nSuccess! User ${email} now has:`);
    console.log('- Active quarterly_pro subscription');
    console.log('- 9999 free usage limit for all features');
    console.log('- 10000 credits added');

  } finally {
    client.release();
    await pool.end();
  }
}

const email = process.argv[2];
if (!email) {
  console.error('Usage: node scripts/add-admin-subscription.js <email>');
  process.exit(1);
}

addSubscription(email).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
