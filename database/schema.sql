-- Ascend Interview Prep - PostgreSQL Schema
-- Run this on your existing Railway PostgreSQL database (alongside cariara tables)
-- This adds subscription, credits, and company prep tables that reference the existing users table

-- =============================================================================
-- SUBSCRIPTIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS ascend_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_customer_id VARCHAR(255) UNIQUE,
    stripe_subscription_id VARCHAR(255),
    plan_type VARCHAR(20) NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'monthly', 'quarterly')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_ascend_subscriptions_user_id ON ascend_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_ascend_subscriptions_stripe_customer ON ascend_subscriptions(stripe_customer_id);

-- =============================================================================
-- CREDITS
-- =============================================================================

CREATE TABLE IF NOT EXISTS ascend_credits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
    lifetime_earned INTEGER NOT NULL DEFAULT 0,
    lifetime_used INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_ascend_credits_user_id ON ascend_credits(user_id);

-- =============================================================================
-- CREDIT TRANSACTIONS (Audit Trail)
-- =============================================================================

CREATE TABLE IF NOT EXISTS ascend_credit_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('subscription', 'addon', 'usage', 'refund', 'bonus')),
    description TEXT,
    reference_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ascend_credit_transactions_user_id ON ascend_credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_ascend_credit_transactions_created_at ON ascend_credit_transactions(created_at DESC);

-- =============================================================================
-- COMPANY PREPS
-- =============================================================================

CREATE TABLE IF NOT EXISTS ascend_company_preps (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    is_free_tier BOOLEAN DEFAULT FALSE,
    inputs JSONB DEFAULT '{}',
    generated JSONB DEFAULT '{}',
    custom_sections JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ascend_company_preps_user_id ON ascend_company_preps(user_id);
CREATE INDEX IF NOT EXISTS idx_ascend_company_preps_updated_at ON ascend_company_preps(updated_at DESC);

-- =============================================================================
-- STRIPE EVENTS (Idempotency)
-- =============================================================================

CREATE TABLE IF NOT EXISTS ascend_stripe_events (
    id VARCHAR(255) PRIMARY KEY,
    type VARCHAR(100) NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Function to initialize user's Ascend data on first access
CREATE OR REPLACE FUNCTION ascend_init_user(p_user_id INTEGER)
RETURNS void AS $$
BEGIN
    -- Create credits record if not exists
    INSERT INTO ascend_credits (user_id, balance, lifetime_earned, lifetime_used)
    VALUES (p_user_id, 0, 0, 0)
    ON CONFLICT (user_id) DO NOTHING;

    -- Create subscription record if not exists
    INSERT INTO ascend_subscriptions (user_id, plan_type, status)
    VALUES (p_user_id, 'free', 'active')
    ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user can create company
CREATE OR REPLACE FUNCTION ascend_can_create_company(p_user_id INTEGER)
RETURNS JSONB AS $$
DECLARE
    v_has_free BOOLEAN;
    v_balance INTEGER;
BEGIN
    -- Initialize user if needed
    PERFORM ascend_init_user(p_user_id);

    -- Check if user has used their free tier
    SELECT EXISTS(
        SELECT 1 FROM ascend_company_preps
        WHERE user_id = p_user_id AND is_free_tier = TRUE
    ) INTO v_has_free;

    -- First company is free
    IF NOT v_has_free THEN
        RETURN jsonb_build_object('allowed', TRUE, 'free', TRUE, 'balance', 0);
    END IF;

    -- Check credit balance
    SELECT balance INTO v_balance
    FROM ascend_credits
    WHERE user_id = p_user_id;

    v_balance := COALESCE(v_balance, 0);

    IF v_balance >= 1 THEN
        RETURN jsonb_build_object('allowed', TRUE, 'free', FALSE, 'balance', v_balance);
    END IF;

    RETURN jsonb_build_object('allowed', FALSE, 'free', FALSE, 'balance', v_balance, 'reason', 'No credits available');
END;
$$ LANGUAGE plpgsql;

-- Function to use a credit
CREATE OR REPLACE FUNCTION ascend_use_credit(p_user_id INTEGER, p_company_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_balance INTEGER;
    v_has_free BOOLEAN;
BEGIN
    -- Check if user has used their free tier
    SELECT EXISTS(
        SELECT 1 FROM ascend_company_preps
        WHERE user_id = p_user_id AND is_free_tier = TRUE
    ) INTO v_has_free;

    -- If no free tier used, this is free
    IF NOT v_has_free THEN
        RETURN TRUE;
    END IF;

    -- Check credit balance
    SELECT balance INTO v_balance
    FROM ascend_credits
    WHERE user_id = p_user_id;

    IF v_balance IS NULL OR v_balance < 1 THEN
        RETURN FALSE;
    END IF;

    -- Deduct credit
    UPDATE ascend_credits
    SET
        balance = balance - 1,
        lifetime_used = lifetime_used + 1,
        updated_at = NOW()
    WHERE user_id = p_user_id;

    -- Record transaction
    INSERT INTO ascend_credit_transactions (user_id, amount, type, description)
    VALUES (p_user_id, -1, 'usage', 'Company prep: ' || p_company_name);

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to add credits
CREATE OR REPLACE FUNCTION ascend_add_credits(
    p_user_id INTEGER,
    p_amount INTEGER,
    p_type VARCHAR(20),
    p_description TEXT DEFAULT NULL,
    p_reference_id VARCHAR(255) DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    -- Initialize user if needed
    PERFORM ascend_init_user(p_user_id);

    -- Update credits balance
    UPDATE ascend_credits
    SET
        balance = balance + p_amount,
        lifetime_earned = lifetime_earned + CASE WHEN p_amount > 0 THEN p_amount ELSE 0 END,
        updated_at = NOW()
    WHERE user_id = p_user_id;

    -- Record transaction
    INSERT INTO ascend_credit_transactions (user_id, amount, type, description, reference_id)
    VALUES (p_user_id, p_amount, p_type, p_description, p_reference_id);
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- FREE USAGE TRACKING (Trial limits)
-- =============================================================================

CREATE TABLE IF NOT EXISTS ascend_free_usage (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    coding_used INTEGER NOT NULL DEFAULT 0,
    coding_limit INTEGER NOT NULL DEFAULT 2,
    design_used INTEGER NOT NULL DEFAULT 0,
    design_limit INTEGER NOT NULL DEFAULT 2,
    company_prep_used INTEGER NOT NULL DEFAULT 0,
    company_prep_limit INTEGER NOT NULL DEFAULT 2,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_ascend_free_usage_user_id ON ascend_free_usage(user_id);

-- Function to initialize free usage for user
CREATE OR REPLACE FUNCTION ascend_init_free_usage(p_user_id INTEGER)
RETURNS void AS $$
BEGIN
    INSERT INTO ascend_free_usage (user_id)
    VALUES (p_user_id)
    ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user can use feature (has subscription OR free allowance)
CREATE OR REPLACE FUNCTION ascend_can_use_feature(p_user_id INTEGER, p_feature VARCHAR(20))
RETURNS JSONB AS $$
DECLARE
    v_plan_type VARCHAR(20);
    v_status VARCHAR(20);
    v_used INTEGER;
    v_limit INTEGER;
BEGIN
    -- Initialize user if needed
    PERFORM ascend_init_user(p_user_id);
    PERFORM ascend_init_free_usage(p_user_id);

    -- Check subscription status
    SELECT plan_type, status INTO v_plan_type, v_status
    FROM ascend_subscriptions
    WHERE user_id = p_user_id;

    -- If has active paid subscription, always allow
    IF v_plan_type IN ('monthly', 'quarterly_pro') AND v_status = 'active' THEN
        RETURN jsonb_build_object(
            'allowed', TRUE,
            'hasSubscription', TRUE,
            'planType', v_plan_type
        );
    END IF;

    -- Check free usage limits
    IF p_feature = 'coding' THEN
        SELECT coding_used, coding_limit INTO v_used, v_limit
        FROM ascend_free_usage WHERE user_id = p_user_id;
    ELSIF p_feature = 'design' THEN
        SELECT design_used, design_limit INTO v_used, v_limit
        FROM ascend_free_usage WHERE user_id = p_user_id;
    ELSIF p_feature = 'company_prep' THEN
        SELECT company_prep_used, company_prep_limit INTO v_used, v_limit
        FROM ascend_free_usage WHERE user_id = p_user_id;
    ELSE
        RETURN jsonb_build_object('allowed', FALSE, 'error', 'Invalid feature');
    END IF;

    v_used := COALESCE(v_used, 0);
    v_limit := COALESCE(v_limit, 2);

    IF v_used < v_limit THEN
        RETURN jsonb_build_object(
            'allowed', TRUE,
            'hasSubscription', FALSE,
            'freeRemaining', v_limit - v_used,
            'freeUsed', v_used,
            'freeLimit', v_limit
        );
    END IF;

    RETURN jsonb_build_object(
        'allowed', FALSE,
        'hasSubscription', FALSE,
        'freeTrialExhausted', TRUE,
        'freeUsed', v_used,
        'freeLimit', v_limit,
        'reason', 'Free trial exhausted. Please subscribe to continue.'
    );
END;
$$ LANGUAGE plpgsql;

-- Function to use free allowance
CREATE OR REPLACE FUNCTION ascend_use_free_allowance(p_user_id INTEGER, p_feature VARCHAR(20))
RETURNS BOOLEAN AS $$
BEGIN
    IF p_feature = 'coding' THEN
        UPDATE ascend_free_usage
        SET coding_used = coding_used + 1, updated_at = NOW()
        WHERE user_id = p_user_id AND coding_used < coding_limit;
    ELSIF p_feature = 'design' THEN
        UPDATE ascend_free_usage
        SET design_used = design_used + 1, updated_at = NOW()
        WHERE user_id = p_user_id AND design_used < design_limit;
    ELSIF p_feature = 'company_prep' THEN
        UPDATE ascend_free_usage
        SET company_prep_used = company_prep_used + 1, updated_at = NOW()
        WHERE user_id = p_user_id AND company_prep_used < company_prep_limit;
    ELSE
        RETURN FALSE;
    END IF;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TRIGGER FOR UPDATED_AT
-- =============================================================================

CREATE OR REPLACE FUNCTION ascend_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ascend_subscriptions_updated_at ON ascend_subscriptions;
CREATE TRIGGER ascend_subscriptions_updated_at
    BEFORE UPDATE ON ascend_subscriptions
    FOR EACH ROW EXECUTE FUNCTION ascend_update_updated_at();

DROP TRIGGER IF EXISTS ascend_company_preps_updated_at ON ascend_company_preps;
CREATE TRIGGER ascend_company_preps_updated_at
    BEFORE UPDATE ON ascend_company_preps
    FOR EACH ROW EXECUTE FUNCTION ascend_update_updated_at();
