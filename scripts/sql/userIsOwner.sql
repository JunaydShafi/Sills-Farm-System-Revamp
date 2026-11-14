BEGIN;

-- Add the owner designation to existing users.
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS is_owner BOOLEAN NOT NULL DEFAULT FALSE;

-- Allow at most one protected owner account.
CREATE UNIQUE INDEX IF NOT EXISTS users_single_owner_idx
ON public.users (is_owner)
WHERE is_owner = TRUE;

-- Protect Ed's existing Administrator account.
UPDATE public.users
SET is_owner = TRUE
WHERE id = 1
  AND username = 'edsills'
  AND role = 'Administrator'
  AND status = 'Active';

-- Verify Ed is the designated owner.
SELECT id, username, role, status, is_owner
FROM public.users
WHERE is_owner = TRUE;

COMMIT;