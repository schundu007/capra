-- Migration: Device licensing for desktop app
-- Ensures one subscription = one device activation

-- =============================================================================
-- DEVICE LICENSES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS ascend_device_licenses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id VARCHAR(255) NOT NULL,
    device_name VARCHAR(255),
    device_platform VARCHAR(50),
    app_version VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deactivated_at TIMESTAMP WITH TIME ZONE,
    deactivated_reason VARCHAR(255),
    UNIQUE(user_id, device_id)
);

CREATE INDEX IF NOT EXISTS idx_ascend_device_licenses_user_id ON ascend_device_licenses(user_id);
CREATE INDEX IF NOT EXISTS idx_ascend_device_licenses_device_id ON ascend_device_licenses(device_id);

-- Function to get user's active device count
CREATE OR REPLACE FUNCTION ascend_get_device_count(p_user_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM ascend_device_licenses
    WHERE user_id = p_user_id AND is_active = TRUE;

    RETURN COALESCE(v_count, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to check if device is registered and active
CREATE OR REPLACE FUNCTION ascend_is_device_registered(p_user_id INTEGER, p_device_id VARCHAR)
RETURNS JSONB AS $$
DECLARE
    v_license RECORD;
BEGIN
    SELECT * INTO v_license
    FROM ascend_device_licenses
    WHERE user_id = p_user_id AND device_id = p_device_id;

    IF v_license IS NULL THEN
        RETURN jsonb_build_object('registered', FALSE);
    END IF;

    IF NOT v_license.is_active THEN
        RETURN jsonb_build_object(
            'registered', TRUE,
            'active', FALSE,
            'deactivatedAt', v_license.deactivated_at,
            'reason', v_license.deactivated_reason
        );
    END IF;

    -- Update last seen
    UPDATE ascend_device_licenses
    SET last_seen_at = NOW()
    WHERE id = v_license.id;

    RETURN jsonb_build_object(
        'registered', TRUE,
        'active', TRUE,
        'deviceName', v_license.device_name,
        'registeredAt', v_license.registered_at
    );
END;
$$ LANGUAGE plpgsql;

-- Function to register a device
CREATE OR REPLACE FUNCTION ascend_register_device(
    p_user_id INTEGER,
    p_device_id VARCHAR,
    p_device_name VARCHAR DEFAULT NULL,
    p_device_platform VARCHAR DEFAULT NULL,
    p_app_version VARCHAR DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_active_count INTEGER;
    v_existing RECORD;
    v_plan_type VARCHAR(20);
    v_device_limit INTEGER;
BEGIN
    -- Check subscription plan to determine device limit
    SELECT plan_type INTO v_plan_type
    FROM ascend_subscriptions
    WHERE user_id = p_user_id AND status = 'active';

    -- Default limit is 1 device per subscription
    v_device_limit := 1;

    -- Check if device already registered for this user
    SELECT * INTO v_existing
    FROM ascend_device_licenses
    WHERE user_id = p_user_id AND device_id = p_device_id;

    IF v_existing IS NOT NULL THEN
        -- Reactivate if previously deactivated
        IF NOT v_existing.is_active THEN
            UPDATE ascend_device_licenses
            SET is_active = TRUE,
                last_seen_at = NOW(),
                deactivated_at = NULL,
                deactivated_reason = NULL,
                app_version = COALESCE(p_app_version, app_version)
            WHERE id = v_existing.id;
        ELSE
            -- Update last seen and app version
            UPDATE ascend_device_licenses
            SET last_seen_at = NOW(),
                app_version = COALESCE(p_app_version, app_version)
            WHERE id = v_existing.id;
        END IF;

        RETURN jsonb_build_object(
            'success', TRUE,
            'registered', TRUE,
            'deviceId', p_device_id,
            'deviceName', v_existing.device_name
        );
    END IF;

    -- Check active device count
    SELECT COUNT(*) INTO v_active_count
    FROM ascend_device_licenses
    WHERE user_id = p_user_id AND is_active = TRUE;

    IF v_active_count >= v_device_limit THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'error', 'device_limit_reached',
            'message', 'Maximum number of devices reached. Please deactivate another device first.',
            'activeDevices', v_active_count,
            'deviceLimit', v_device_limit
        );
    END IF;

    -- Register new device
    INSERT INTO ascend_device_licenses (user_id, device_id, device_name, device_platform, app_version)
    VALUES (p_user_id, p_device_id, p_device_name, p_device_platform, p_app_version);

    RETURN jsonb_build_object(
        'success', TRUE,
        'registered', TRUE,
        'deviceId', p_device_id,
        'deviceName', p_device_name,
        'isNewDevice', TRUE
    );
END;
$$ LANGUAGE plpgsql;

-- Function to deactivate a device
CREATE OR REPLACE FUNCTION ascend_deactivate_device(
    p_user_id INTEGER,
    p_device_id VARCHAR,
    p_reason VARCHAR DEFAULT 'User requested'
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE ascend_device_licenses
    SET is_active = FALSE,
        deactivated_at = NOW(),
        deactivated_reason = p_reason
    WHERE user_id = p_user_id AND device_id = p_device_id AND is_active = TRUE;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to deactivate all devices for a user
CREATE OR REPLACE FUNCTION ascend_deactivate_all_devices(
    p_user_id INTEGER,
    p_reason VARCHAR DEFAULT 'Subscription cancelled'
)
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE ascend_device_licenses
    SET is_active = FALSE,
        deactivated_at = NOW(),
        deactivated_reason = p_reason
    WHERE user_id = p_user_id AND is_active = TRUE;

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;
