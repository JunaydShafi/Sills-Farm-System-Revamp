-- Creates a secure token table for email verification
-- and password recovery.
-- Existing user accounts and sessions remain unchanged.

BEGIN;

CREATE TABLE public.user_email_tokens (
    id UUID PRIMARY KEY,
    user_id INTEGER NOT NULL,
    email VARCHAR(254) NOT NULL,
    token_hash VARCHAR(64) NOT NULL,
    purpose VARCHAR(30) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,

    CONSTRAINT user_email_tokens_user_fk
        FOREIGN KEY (user_id)
        REFERENCES public.users(id)
        ON DELETE CASCADE
        ON UPDATE NO ACTION,

    CONSTRAINT user_email_tokens_token_hash_key
        UNIQUE (token_hash),

    CONSTRAINT user_email_tokens_purpose_check
        CHECK (
            purpose IN (
                'EMAIL_VERIFICATION',
                'PASSWORD_RESET'
            )
        ),

    CONSTRAINT user_email_tokens_hash_check
        CHECK (token_hash ~ '^[a-f0-9]{64}$'),

    CONSTRAINT user_email_tokens_email_check
        CHECK (
            email <> ''
            AND email = LOWER(BTRIM(email))
        ),

    CONSTRAINT user_email_tokens_expiration_check
        CHECK (expires_at > created_at)
);

CREATE INDEX idx_user_email_tokens_user_purpose
ON public.user_email_tokens (user_id, purpose);

CREATE INDEX idx_user_email_tokens_expires_at
ON public.user_email_tokens (expires_at);

COMMIT;