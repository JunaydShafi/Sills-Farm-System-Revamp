-- Demo employees and pay records for the development database (SFBMSR-285)
-- All names, addresses, and SSN digits are FAKE. Never put real employee data here.
--
-- Run after employeePayroll.sql:
--   npx prisma db execute --file scripts/sql/seedEmployeePayroll.sql
--
-- Safe to run again: existing Employee IDs and existing pay periods are skipped.

INSERT INTO public.employees
    (employee_code, name, street, city, state, zip, phone, active, status,
     ssn_last4, pay_rate, irr_pay_rate, allowances, withholding, child_support,
     start_date, notes)
VALUES
    ('001', 'John Doe', '123 Main St', 'Pleasant Grove', 'CA', '95668', '916-555-0101',
     'Active', 'Active', '1234', 22.00, NULL, 0, 1, 0, '2020-04-20', 'Demo record'),
    ('002', 'Jane Doe', '456 Oak Ave', 'Sacramento', 'CA', '95814', '916-555-0102',
     'Active', 'Active', '5678', 24.50, NULL, 1, 2, 0, '2021-06-01', 'Demo record'),
    ('003', 'Robert Garcia', '789 Field Rd', 'Rio Linda', 'CA', '95673', '916-555-0103',
     'Inactive', 'Inactive', '9012', 19.75, NULL, 0, 0, 0, '2019-03-15', 'Demo record - seasonal'),
    ('004', 'Maria Smith', '22 Orchard Ln', 'Elverta', 'CA', '95626', '916-555-0104',
     'Active', 'Active', '3456', 21.00, NULL, 0, 1, 0, '2022-08-08', 'Demo record')
ON CONFLICT (employee_code) DO NOTHING;

-- Two October pay periods for the active demo employees.
-- Amounts follow the Pay Employees rules: hours x rate x (1, 1.5, or 2).
INSERT INTO public.payroll_records
    (employee_id, pay_date, period_start, period_end, pay_rate,
     regular_hours, overtime_hours, holiday_hours,
     regular_amount, overtime_amount, holiday_amount, gross_pay, net_pay)
SELECT e.id, p.pay_date::date, p.period_start::date, p.period_end::date, e.pay_rate,
       p.regular_hours, p.overtime_hours, p.holiday_hours,
       ROUND(p.regular_hours * e.pay_rate, 2),
       ROUND(p.overtime_hours * e.pay_rate * 1.5, 2),
       ROUND(p.holiday_hours * e.pay_rate * 2, 2),
       ROUND(p.regular_hours * e.pay_rate, 2)
         + ROUND(p.overtime_hours * e.pay_rate * 1.5, 2)
         + ROUND(p.holiday_hours * e.pay_rate * 2, 2),
       ROUND(p.regular_hours * e.pay_rate, 2)
         + ROUND(p.overtime_hours * e.pay_rate * 1.5, 2)
         + ROUND(p.holiday_hours * e.pay_rate * 2, 2)
FROM (VALUES
    ('001', '2026-10-16', '2026-10-01', '2026-10-15', 80.00, 4.00, 0.00),
    ('001', '2026-10-31', '2026-10-16', '2026-10-31', 80.00, 0.00, 0.00),
    ('002', '2026-10-16', '2026-10-01', '2026-10-15', 80.00, 0.00, 0.00),
    ('002', '2026-10-31', '2026-10-16', '2026-10-31', 72.00, 2.50, 8.00),
    ('004', '2026-10-16', '2026-10-01', '2026-10-15', 76.50, 0.00, 0.00),
    ('004', '2026-10-31', '2026-10-16', '2026-10-31', 80.00, 6.00, 0.00)
) AS p (code, pay_date, period_start, period_end, regular_hours, overtime_hours, holiday_hours)
JOIN public.employees e ON e.employee_code = p.code
WHERE NOT EXISTS (
    SELECT 1 FROM public.payroll_records r
    WHERE r.employee_id = e.id
      AND r.period_start = p.period_start::date
      AND r.period_end = p.period_end::date
);
