-- SFBMSR-108: Store the size selected for each ordered product.
ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS size_lbs INTEGER;