-- Create a sequence for automatically generated numeric Customer Codes.
-- This sequence is used by the Customers API when creating new customers.

CREATE SEQUENCE IF NOT EXISTS public.customer_code_seq
START WITH 1
INCREMENT BY 1;