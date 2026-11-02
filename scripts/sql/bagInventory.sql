-- Bag Inventory tables. 

CREATE TABLE IF NOT EXISTS public.processes (
    id SERIAL PRIMARY KEY,
    process_number INTEGER NOT NULL UNIQUE,
    description VARCHAR(150) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.sale_items (
    id SERIAL PRIMARY KEY,
    item_code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.bag_inventory_items (
    id SERIAL PRIMARY KEY,
    process_id INTEGER NOT NULL REFERENCES public.processes(id) ON DELETE RESTRICT,
    sale_item_id INTEGER NOT NULL REFERENCES public.sale_items(id) ON DELETE RESTRICT,
    factor_lbs INTEGER NOT NULL CHECK (factor_lbs > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (process_id, sale_item_id, factor_lbs)
);

-- Adjustment records may be negative to correct a count; all others must be positive.
CREATE TABLE IF NOT EXISTS public.bagging_records (
    id SERIAL PRIMARY KEY,
    inventory_item_id INTEGER NOT NULL REFERENCES public.bag_inventory_items(id) ON DELETE RESTRICT,
    bag_date DATE NOT NULL,
    quantity INTEGER NOT NULL,
    is_adjustment BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(20) NOT NULL DEFAULT 'Completed' CHECK (status IN ('Pending', 'Completed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (is_adjustment OR quantity > 0)
);

CREATE INDEX IF NOT EXISTS bagging_records_inventory_item_id_idx
ON public.bagging_records(inventory_item_id);

CREATE TABLE IF NOT EXISTS public.bag_sales (
    id SERIAL PRIMARY KEY,
    inventory_item_id INTEGER NOT NULL REFERENCES public.bag_inventory_items(id) ON DELETE RESTRICT,
    sale_date DATE NOT NULL,
    units_sold INTEGER NOT NULL CHECK (units_sold > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS bag_sales_inventory_item_id_idx
ON public.bag_sales(inventory_item_id);
