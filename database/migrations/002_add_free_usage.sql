-- Migration: Add free usage tracking for freemium model
-- Run this on your Railway PostgreSQL database

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

-- Update ascend_init_user to also init free usage
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

    -- Create free usage record if not exists
    INSERT INTO ascend_free_usage (user_id)
    VALUES (p_user_id)
    ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS ascend_free_usage_updated_at ON ascend_free_usage;
CREATE TRIGGER ascend_free_usage_updated_at
    BEFORE UPDATE ON ascend_free_usage
    FOR EACH ROW EXECUTE FUNCTION ascend_update_updated_at();

-- Update credit_transactions type check to include desktop_lifetime
ALTER TABLE ascend_credit_transactions
DROP CONSTRAINT IF EXISTS ascend_credit_transactions_type_check;

ALTER TABLE ascend_credit_transactions
ADD CONSTRAINT ascend_credit_transactions_type_check
CHECK (type IN ('subscription', 'addon', 'usage', 'refund', 'bonus', 'desktop_lifetime'));

-- Update subscriptions plan_type to include quarterly_pro
ALTER TABLE ascend_subscriptions
DROP CONSTRAINT IF EXISTS ascend_subscriptions_plan_type_check;

ALTER TABLE ascend_subscriptions
ADD CONSTRAINT ascend_subscriptions_plan_type_check
CHECK (plan_type IN ('free', 'monthly', 'quarterly', 'quarterly_pro'));
