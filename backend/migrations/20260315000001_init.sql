CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
    id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name            TEXT          NOT NULL,
    last_name             TEXT          NOT NULL,
    email                 TEXT          NOT NULL UNIQUE,
    password_hash         TEXT          NOT NULL,
    -- onboarding (nullable until POST /user/onboarding is called)
    goals                 TEXT[]        NULL,
    income_amount         NUMERIC(12,2) NULL,
    income_frequency      TEXT          NULL
        CHECK (income_frequency IN ('daily','weekly','biweekly','monthly','annually')),
    budget_needs          INT           NULL CHECK (budget_needs BETWEEN 0 AND 100),
    budget_wants          INT           NULL CHECK (budget_wants BETWEEN 0 AND 100),
    budget_savings        INT           NULL CHECK (budget_savings BETWEEN 0 AND 100),
    onboarding_completed_at TIMESTAMPTZ NULL,
    created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users (email);
