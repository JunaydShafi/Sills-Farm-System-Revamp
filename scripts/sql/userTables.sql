CREATE TABLE IF NOT EXISTS public.users (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    employee_id INTEGER,
    name VARCHAR(150) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'Employee',
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT users_role_check
        CHECK (role IN ('Administrator', 'Employee')),

    CONSTRAINT users_status_check
        CHECK (status IN ('Active', 'Inactive'))
);