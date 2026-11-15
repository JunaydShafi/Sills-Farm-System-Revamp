-- Demo processes, products, bagging records and sales for the development database.
-- All values are FAKE and match the Bag Data and Bag Inventory mockups.
--
-- Run after the bagging tables exist (see bagInventory.sql):
--   npx prisma db execute --file scripts/sql/seedBagInventory.sql
--
-- Safe to run again: existing processes, products and inventory rows are skipped,
-- and bagging records and sales are only added when those tables are empty.

INSERT INTO public.processes (process_number, description)
VALUES
    (1001, 'Black Beans'),
    (1002, 'Split Peas'),
    (1003, 'Pinto Beans'),
    (1004, 'Green Peas'),
    (1005, 'Yellow Peas'),
    (1006, 'Kidney Beans'),
    (1007, 'Navy Beans'),
    (1008, 'Chickpeas'),
    (1009, 'Lima Beans'),
    (1010, 'Snow Peas'),
    (1011, 'Red Beans')
ON CONFLICT (process_number) DO NOTHING;

INSERT INTO public.sale_items (item_code, name)
VALUES
    ('2001', 'Black Beans'),
    ('2002', 'Split Peas'),
    ('2003', 'Pinto Beans'),
    ('2004', 'Green Peas'),
    ('2005', 'Yellow Peas'),
    ('2006', 'Kidney Beans'),
    ('2007', 'Navy Beans'),
    ('2008', 'Chickpeas'),
    ('2009', 'Lima Beans'),
    ('2010', 'Snow Peas'),
    ('2011', 'Red Beans')
ON CONFLICT (item_code) DO NOTHING;

-- One Bag Inventory row per proc, product and bag size: proc, product code, factor
INSERT INTO public.bag_inventory_items (process_id, sale_item_id, factor_lbs)
SELECT p.id, s.id, v.factor_lbs
FROM (VALUES
    (1001, '2001', 25),
    (1002, '2002', 50),
    (1003, '2003', 25),
    (1004, '2004', 50),
    (1005, '2005', 25),
    (1006, '2006', 50),
    (1007, '2007', 25),
    (1008, '2008', 50),
    (1009, '2009', 25),
    (1010, '2010', 50),
    (1011, '2011', 25)
) AS v (process_number, item_code, factor_lbs)
JOIN public.processes p ON p.process_number = v.process_number
JOIN public.sale_items s ON s.item_code = v.item_code
ON CONFLICT (process_id, sale_item_id, factor_lbs) DO NOTHING;

-- Bag Data mockup rows: date, quantity, proc, product code, size
INSERT INTO public.bagging_records (inventory_item_id, bag_date, quantity, is_adjustment, status)
SELECT i.id, v.bag_date::date, v.quantity, false, 'Completed'
FROM (VALUES
    ('2026-09-14',  80, 1001, '2001', 25),
    ('2026-09-15', 100, 1002, '2002', 50),
    ('2026-09-16',  80, 1003, '2003', 25),
    ('2026-09-17', 150, 1004, '2004', 50),
    ('2026-09-18',  90, 1005, '2005', 25),
    ('2026-09-19', 110, 1006, '2006', 50),
    ('2026-09-20',  75, 1007, '2007', 25),
    ('2026-09-21', 140, 1008, '2008', 50),
    ('2026-09-22',  60, 1009, '2009', 25),
    ('2026-09-23',  95, 1010, '2010', 50),
    ('2026-09-24', 130, 1011, '2011', 25),
    ('2026-09-25',  40, 1001, '2001', 25)
) AS v (bag_date, quantity, process_number, item_code, factor_lbs)
JOIN public.processes p ON p.process_number = v.process_number
JOIN public.sale_items s ON s.item_code = v.item_code
JOIN public.bag_inventory_items i
    ON i.process_id = p.id AND i.sale_item_id = s.id AND i.factor_lbs = v.factor_lbs
WHERE NOT EXISTS (SELECT 1 FROM public.bagging_records);

-- Units sold so Bag Inventory matches its mockup: date, units, proc, product code, size
INSERT INTO public.bag_sales (inventory_item_id, sale_date, units_sold)
SELECT i.id, v.sale_date::date, v.units_sold
FROM (VALUES
    ('2026-10-01',  72, 1001, '2001', 25),
    ('2026-10-01',  65, 1002, '2002', 50),
    ('2026-10-02',  50, 1003, '2003', 25),
    ('2026-10-02', 100, 1004, '2004', 50),
    ('2026-10-03',  55, 1005, '2005', 25),
    ('2026-10-03',  70, 1006, '2006', 50),
    ('2026-10-06',  45, 1007, '2007', 25),
    ('2026-10-06',  90, 1008, '2008', 50),
    ('2026-10-07',  35, 1009, '2009', 25),
    ('2026-10-07',  60, 1010, '2010', 50),
    ('2026-10-08',  85, 1011, '2011', 25)
) AS v (sale_date, units_sold, process_number, item_code, factor_lbs)
JOIN public.processes p ON p.process_number = v.process_number
JOIN public.sale_items s ON s.item_code = v.item_code
JOIN public.bag_inventory_items i
    ON i.process_id = p.id AND i.sale_item_id = s.id AND i.factor_lbs = v.factor_lbs
WHERE NOT EXISTS (SELECT 1 FROM public.bag_sales);
