-- Sprint 4: API request throttling
-- Stores shared request counters for sensitive API endpoints.

CREATE TABLE IF NOT EXISTS public.api_rate_limits (
    key VARCHAR(255) PRIMARY KEY,
    request_count INTEGER NOT NULL DEFAULT 0,
    window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT api_rate_limits_request_count_check
        CHECK (request_count >= 0)
);

CREATE INDEX IF NOT EXISTS api_rate_limits_updated_at_idx
ON public.api_rate_limits (updated_at);