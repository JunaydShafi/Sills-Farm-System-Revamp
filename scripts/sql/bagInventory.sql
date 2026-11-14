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

-- Bags made from a processing record. adjustment corrects the count (+/-).
CREATE TABLE IF NOT EXISTS public.bagging_records (
    id SERIAL PRIMARY KEY,
    bag_date DATE NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity >= 0),
    size_lbs INTEGER NOT NULL CHECK (size_lbs > 0),
    adjustment INTEGER NOT NULL DEFAULT 0,
    sale_item_id INTEGER NOT NULL REFERENCES public.sale_items(id) ON DELETE RESTRICT,
    process_id INTEGER NOT NULL REFERENCES public.processes(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (quantity <> 0 OR adjustment <> 0)
);

CREATE INDEX IF NOT EXISTS bagging_records_process_id_sale_item_id_size_lbs_idx
ON public.bagging_records(process_id, sale_item_id, size_lbs);

CREATE TABLE IF NOT EXISTS public.bag_sales (
    id SERIAL PRIMARY KEY,
    sale_date DATE NOT NULL,
    units_sold INTEGER NOT NULL CHECK (units_sold > 0),
    size_lbs INTEGER NOT NULL CHECK (size_lbs > 0),
    sale_item_id INTEGER NOT NULL REFERENCES public.sale_items(id) ON DELETE RESTRICT,
    process_id INTEGER NOT NULL REFERENCES public.processes(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS bag_sales_process_id_sale_item_id_size_lbs_idx
ON public.bag_sales(process_id, sale_item_id, size_lbs);
