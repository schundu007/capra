-- Migration: Add Usage Tracking System
-- Run this migration to enable tracking of coding problems, system designs, company preps, and interview time

-- =============================================================================
-- USAGE TRACKING TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS ascend_usage (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Coding problems
    coding_problems_allowance INTEGER NOT NULL DEFAULT 0,
    coding_problems_used INTEGER NOT NULL DEFAULT 0,

    -- System designs
    system_designs_allowance INTEGER NOT NULL DEFAULT 0,
    system_designs_used INTEGER NOT NULL DEFAULT 0,

    -- Company preps
    company_preps_allowance INTEGER NOT NULL DEFAULT 0,
    company_preps_used INTEGER NOT NULL DEFAULT 0,

    -- Interview session time (in minutes)
    interview_minutes_allowance INTEGER NOT NULL DEFAULT 0,
    interview_minutes_used INTEGER NOT NULL DEFAULT 0,

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_ascend_usage_user_id ON ascend_usage(user_id);

-- =============================================================================
-- CONSTANTS FOR CREDIT MULTIPLIERS
-- =============================================================================
-- 1 credit = 10 coding problems, 5 system designs, 1 company prep, 75 minutes interview

-- =============================================================================
-- UPDATED INIT FUNCTION
-- =============================================================================

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

    -- Create usage record if not exists
    INSERT INTO ascend_usage (user_id)
    VALUES (p_user_id)
    ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- ADD ALLOWANCES WHEN CREDITS ARE ADDED
-- =============================================================================

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

    -- Add usage allowances (only for positive credit additions)
    IF p_amount > 0 THEN
        UPDATE ascend_usage
        SET
            coding_problems_allowance = coding_problems_allowance + (p_amount * 10),
            system_designs_allowance = system_designs_allowance + (p_amount * 5),
            company_preps_allowance = company_preps_allowance + (p_amount * 1),
            interview_minutes_allowance = interview_minutes_allowance + (p_amount * 75),
            updated_at = NOW()
        WHERE user_id = p_user_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- CHECK AND USE CODING PROBLEM
-- =============================================================================

CREATE OR REPLACE FUNCTION ascend_can_use_coding(p_user_id INTEGER)
RETURNS JSONB AS $$
DECLARE
    v_allowance INTEGER;
    v_used INTEGER;
    v_remaining INTEGER;
BEGIN
    -- Initialize user if needed
    PERFORM ascend_init_user(p_user_id);

    SELECT coding_problems_allowance, coding_problems_used
    INTO v_allowance, v_used
    FROM ascend_usage
    WHERE user_id = p_user_id;

    v_allowance := COALESCE(v_allowance, 0);
    v_used := COALESCE(v_used, 0);
    v_remaining := v_allowance - v_used;

    IF v_remaining > 0 THEN
        RETURN jsonb_build_object('allowed', TRUE, 'remaining', v_remaining, 'used', v_used, 'allowance', v_allowance);
    END IF;

    RETURN jsonb_build_object('allowed', FALSE, 'remaining', 0, 'used', v_used, 'allowance', v_allowance, 'reason', 'No coding problems remaining. Please purchase more credits.');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION ascend_use_coding(p_user_id INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    v_can_use JSONB;
BEGIN
    v_can_use := ascend_can_use_coding(p_user_id);

    IF (v_can_use->>'allowed')::BOOLEAN THEN
        UPDATE ascend_usage
        SET coding_problems_used = coding_problems_used + 1, updated_at = NOW()
        WHERE user_id = p_user_id;
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- CHECK AND USE SYSTEM DESIGN
-- =============================================================================

CREATE OR REPLACE FUNCTION ascend_can_use_system_design(p_user_id INTEGER)
RETURNS JSONB AS $$
DECLARE
    v_allowance INTEGER;
    v_used INTEGER;
    v_remaining INTEGER;
BEGIN
    -- Initialize user if needed
    PERFORM ascend_init_user(p_user_id);

    SELECT system_designs_allowance, system_designs_used
    INTO v_allowance, v_used
    FROM ascend_usage
    WHERE user_id = p_user_id;

    v_allowance := COALESCE(v_allowance, 0);
    v_used := COALESCE(v_used, 0);
    v_remaining := v_allowance - v_used;

    IF v_remaining > 0 THEN
        RETURN jsonb_build_object('allowed', TRUE, 'remaining', v_remaining, 'used', v_used, 'allowance', v_allowance);
    END IF;

    RETURN jsonb_build_object('allowed', FALSE, 'remaining', 0, 'used', v_used, 'allowance', v_allowance, 'reason', 'No system designs remaining. Please purchase more credits.');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION ascend_use_system_design(p_user_id INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    v_can_use JSONB;
BEGIN
    v_can_use := ascend_can_use_system_design(p_user_id);

    IF (v_can_use->>'allowed')::BOOLEAN THEN
        UPDATE ascend_usage
        SET system_designs_used = system_designs_used + 1, updated_at = NOW()
        WHERE user_id = p_user_id;
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- CHECK AND USE COMPANY PREP (Updated)
-- =============================================================================

CREATE OR REPLACE FUNCTION ascend_can_create_company(p_user_id INTEGER)
RETURNS JSONB AS $$
DECLARE
    v_allowance INTEGER;
    v_used INTEGER;
    v_remaining INTEGER;
BEGIN
    -- Initialize user if needed
    PERFORM ascend_init_user(p_user_id);

    SELECT company_preps_allowance, company_preps_used
    INTO v_allowance, v_used
    FROM ascend_usage
    WHERE user_id = p_user_id;

    v_allowance := COALESCE(v_allowance, 0);
    v_used := COALESCE(v_used, 0);
    v_remaining := v_allowance - v_used;

    IF v_remaining > 0 THEN
        RETURN jsonb_build_object('allowed', TRUE, 'remaining', v_remaining, 'used', v_used, 'allowance', v_allowance);
    END IF;

    RETURN jsonb_build_object('allowed', FALSE, 'remaining', 0, 'used', v_used, 'allowance', v_allowance, 'reason', 'No company preps remaining. Please purchase more credits.');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION ascend_use_credit(p_user_id INTEGER, p_company_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_can_use JSONB;
BEGIN
    v_can_use := ascend_can_create_company(p_user_id);

    IF (v_can_use->>'allowed')::BOOLEAN THEN
        UPDATE ascend_usage
        SET company_preps_used = company_preps_used + 1, updated_at = NOW()
        WHERE user_id = p_user_id;

        -- Also update the old credits table for backwards compatibility
        UPDATE ascend_credits
        SET lifetime_used = lifetime_used + 1, updated_at = NOW()
        WHERE user_id = p_user_id;

        -- Record transaction
        INSERT INTO ascend_credit_transactions (user_id, amount, type, description)
        VALUES (p_user_id, -1, 'usage', 'Company prep: ' || p_company_name);

        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- CHECK AND USE INTERVIEW TIME
-- =============================================================================

CREATE OR REPLACE FUNCTION ascend_can_use_interview(p_user_id INTEGER, p_minutes INTEGER DEFAULT 1)
RETURNS JSONB AS $$
DECLARE
    v_allowance INTEGER;
    v_used INTEGER;
    v_remaining INTEGER;
BEGIN
    -- Initialize user if needed
    PERFORM ascend_init_user(p_user_id);

    SELECT interview_minutes_allowance, interview_minutes_used
    INTO v_allowance, v_used
    FROM ascend_usage
    WHERE user_id = p_user_id;

    v_allowance := COALESCE(v_allowance, 0);
    v_used := COALESCE(v_used, 0);
    v_remaining := v_allowance - v_used;

    IF v_remaining >= p_minutes THEN
        RETURN jsonb_build_object('allowed', TRUE, 'remaining', v_remaining, 'used', v_used, 'allowance', v_allowance);
    END IF;

    RETURN jsonb_build_object('allowed', FALSE, 'remaining', v_remaining, 'used', v_used, 'allowance', v_allowance, 'reason', 'Not enough interview time remaining. Please purchase more credits.');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION ascend_use_interview(p_user_id INTEGER, p_minutes INTEGER DEFAULT 1)
RETURNS BOOLEAN AS $$
DECLARE
    v_can_use JSONB;
BEGIN
    v_can_use := ascend_can_use_interview(p_user_id, p_minutes);

    IF (v_can_use->>'allowed')::BOOLEAN THEN
        UPDATE ascend_usage
        SET interview_minutes_used = interview_minutes_used + p_minutes, updated_at = NOW()
        WHERE user_id = p_user_id;
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- GET FULL USAGE INFO
-- =============================================================================

CREATE OR REPLACE FUNCTION ascend_get_usage(p_user_id INTEGER)
RETURNS JSONB AS $$
DECLARE
    v_usage RECORD;
BEGIN
    -- Initialize user if needed
    PERFORM ascend_init_user(p_user_id);

    SELECT * INTO v_usage FROM ascend_usage WHERE user_id = p_user_id;

    RETURN jsonb_build_object(
        'coding', jsonb_build_object(
            'allowance', COALESCE(v_usage.coding_problems_allowance, 0),
            'used', COALESCE(v_usage.coding_problems_used, 0),
            'remaining', COALESCE(v_usage.coding_problems_allowance, 0) - COALESCE(v_usage.coding_problems_used, 0)
        ),
        'systemDesign', jsonb_build_object(
            'allowance', COALESCE(v_usage.system_designs_allowance, 0),
            'used', COALESCE(v_usage.system_designs_used, 0),
            'remaining', COALESCE(v_usage.system_designs_allowance, 0) - COALESCE(v_usage.system_designs_used, 0)
        ),
        'companyPrep', jsonb_build_object(
            'allowance', COALESCE(v_usage.company_preps_allowance, 0),
            'used', COALESCE(v_usage.company_preps_used, 0),
            'remaining', COALESCE(v_usage.company_preps_allowance, 0) - COALESCE(v_usage.company_preps_used, 0)
        ),
        'interview', jsonb_build_object(
            'allowance', COALESCE(v_usage.interview_minutes_allowance, 0),
            'used', COALESCE(v_usage.interview_minutes_used, 0),
            'remaining', COALESCE(v_usage.interview_minutes_allowance, 0) - COALESCE(v_usage.interview_minutes_used, 0)
        )
    );
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TRIGGER FOR UPDATED_AT ON USAGE TABLE
-- =============================================================================

DROP TRIGGER IF EXISTS ascend_usage_updated_at ON ascend_usage;
CREATE TRIGGER ascend_usage_updated_at
    BEFORE UPDATE ON ascend_usage
    FOR EACH ROW EXECUTE FUNCTION ascend_update_updated_at();
