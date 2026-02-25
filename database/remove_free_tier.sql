-- Migration: Remove free tier - all companies require credits
-- Run this after the initial schema

-- Update function to check if user can create company (no free tier)
CREATE OR REPLACE FUNCTION ascend_can_create_company(p_user_id INTEGER)
RETURNS JSONB AS $$
DECLARE
    v_balance INTEGER;
BEGIN
    -- Initialize user if needed
    PERFORM ascend_init_user(p_user_id);

    -- Check credit balance
    SELECT balance INTO v_balance
    FROM ascend_credits
    WHERE user_id = p_user_id;

    v_balance := COALESCE(v_balance, 0);

    IF v_balance >= 1 THEN
        RETURN jsonb_build_object('allowed', TRUE, 'balance', v_balance);
    END IF;

    RETURN jsonb_build_object('allowed', FALSE, 'balance', v_balance, 'reason', 'No credits available. Please purchase a subscription.');
END;
$$ LANGUAGE plpgsql;

-- Update function to use a credit (no free tier check)
CREATE OR REPLACE FUNCTION ascend_use_credit(p_user_id INTEGER, p_company_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_balance INTEGER;
BEGIN
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
