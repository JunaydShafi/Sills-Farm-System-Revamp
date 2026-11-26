-- Add one optional shipping address per customer.
-- Existing customers use their main address by default.
ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS shipping_same_as_main BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS shipping_address VARCHAR(255),
  ADD COLUMN IF NOT EXISTS shipping_city VARCHAR(100),
  ADD COLUMN IF NOT EXISTS shipping_state VARCHAR(2),
  ADD COLUMN IF NOT EXISTS shipping_zip VARCHAR(10);