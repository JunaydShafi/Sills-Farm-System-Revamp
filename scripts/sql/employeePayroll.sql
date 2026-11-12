-- Employee and payroll tables (SFBMSR-285)
-- Used by the Employees, Pay Employees, Payroll, and Earnings pages.
--
-- Run once against the shared database:
--   npx prisma db execute --file scripts/sql/employeePayroll.sql
--
-- Safe to run again: every statement uses IF NOT EXISTS, and nothing is
-- dropped or altered. Do not use prisma migrate dev / db push on this database.

-- ---------------------------------------------------------------------------
-- employees: one row per employee shown on the Employees page
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.employees (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    -- The "Employee ID" typed on the Employees page (e.g. 001). Must be unique.
    employee_code VARCHAR(20) NOT NULL UNIQUE,

    name VARCHAR(150) NOT NULL,
    street VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    zip VARCHAR(10) NOT NULL,
    phone VARCHAR(12),

    active VARCHAR(20) NOT NULL DEFAULT 'Active',
    status VARCHAR(20) NOT NULL DEFAULT 'Active',

    -- Only the last four SSN digits are stored. The full SSN is never saved
    -- until the Product Owner decides how it must be protected.
    ssn_last4 CHAR(4) NOT NULL,

    pay_rate NUMERIC(10, 2) NOT NULL,
    -- NULL means "NA" (no irregular pay rate)
    irr_pay_rate NUMERIC(10, 2),

    allowances NUMERIC(8, 2) NOT NULL DEFAULT 0,
    withholding NUMERIC(10, 2) NOT NULL DEFAULT 0,
    child_support NUMERIC(10, 2) NOT NULL DEFAULT 0,

    start_date DATE NOT NULL,
    notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT employees_active_check CHECK (active IN ('Active', 'Inactive')),
    CONSTRAINT employees_status_check CHECK (status IN ('Active', 'Inactive')),
    CONSTRAINT employees_state_check CHECK (state ~ '^[A-Z]{2}$'),
    CONSTRAINT employees_zip_check CHECK (zip ~ '^[0-9]{5}(-[0-9]{4})?$'),
    CONSTRAINT employees_ssn_last4_check CHECK (ssn_last4 ~ '^[0-9]{4}$'),
    CONSTRAINT employees_pay_rate_check CHECK (pay_rate > 0),
    CONSTRAINT employees_irr_pay_rate_check CHECK (irr_pay_rate IS NULL OR irr_pay_rate > 0),
    CONSTRAINT employees_amounts_check CHECK (
        allowances >= 0 AND withholding >= 0 AND child_support >= 0
    )
);

CREATE INDEX IF NOT EXISTS idx_employees_name ON public.employees (name);

-- ---------------------------------------------------------------------------
-- payroll_records: one row per payment saved on the Pay Employees page
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payroll_records (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    -- RESTRICT keeps pay history: an employee with payroll records cannot be
    -- deleted (the Employees page sets them to Inactive instead).
    employee_id INTEGER NOT NULL
        REFERENCES public.employees (id) ON DELETE RESTRICT,

    -- Filled in once paychecks are printed (future story)
    check_number VARCHAR(20),

    pay_date DATE NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,

    -- Pay rate at the time of payment, so later raises don't change history
    pay_rate NUMERIC(10, 2) NOT NULL,

    regular_hours NUMERIC(6, 2) NOT NULL DEFAULT 0,
    overtime_hours NUMERIC(6, 2) NOT NULL DEFAULT 0,
    holiday_hours NUMERIC(6, 2) NOT NULL DEFAULT 0,

    regular_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    overtime_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    holiday_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,

    gross_pay NUMERIC(10, 2) NOT NULL,

    -- Tax and deduction amounts stay 0 until payroll tax calculations are added
    fica NUMERIC(10, 2) NOT NULL DEFAULT 0,
    medicare NUMERIC(10, 2) NOT NULL DEFAULT 0,
    federal_tax NUMERIC(10, 2) NOT NULL DEFAULT 0,
    state_disability NUMERIC(10, 2) NOT NULL DEFAULT 0,
    child_support NUMERIC(10, 2) NOT NULL DEFAULT 0,

    net_pay NUMERIC(10, 2) NOT NULL,

    -- users.id of the signed-in user who saved the payment. Kept as a plain
    -- number (no foreign key) because the app's database account isn't allowed
    -- to reference the users table.
    created_by INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT payroll_period_check CHECK (period_end >= period_start),
    CONSTRAINT payroll_hours_check CHECK (
        regular_hours >= 0 AND overtime_hours >= 0 AND holiday_hours >= 0
        AND regular_hours + overtime_hours + holiday_hours > 0
    ),
    CONSTRAINT payroll_amounts_check CHECK (
        pay_rate > 0 AND gross_pay >= 0
        AND fica >= 0 AND medicare >= 0 AND federal_tax >= 0
        AND state_disability >= 0 AND child_support >= 0
    )
);

CREATE INDEX IF NOT EXISTS idx_payroll_records_employee_id ON public.payroll_records (employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_records_pay_date ON public.payroll_records (pay_date);
