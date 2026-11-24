
-- Adds email support for user accounts.
-- Supports email verification and secure password recovery.
-- Existing user accounts retain all their current data.

BEGIN;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS email VARCHAR(254),
ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;

-- Prevent multiple accounts from sharing an email address.
CREATE UNIQUE INDEX IF NOT EXISTS users_email_key
ON public.users (email);

-- Enforce consistent email normalization.
ALTER TABLE public.users
ADD CONSTRAINT users_email_normalized_check
CHECK (email IS NULL OR email = LOWER(BTRIM(email)));

COMMIT;
