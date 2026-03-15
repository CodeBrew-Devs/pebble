-- One account per user (Pebble's simple model)
CREATE TABLE accounts (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID        NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_accounts_user_id ON accounts (user_id);

-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE transactions (
    id         UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID          NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    user_id    UUID          NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    name       TEXT          NOT NULL,
    amount     NUMERIC(12,2) NOT NULL,
    date       DATE          NOT NULL,
    category   TEXT          NULL
        CHECK (category IN ('needs', 'wants', 'savings')),
    created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_id ON transactions (user_id);
CREATE INDEX idx_transactions_date    ON transactions (date DESC);

-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE tags (
    id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name    TEXT NOT NULL,
    UNIQUE (user_id, name)
);

CREATE INDEX idx_tags_user_id ON tags (user_id);

-- ─────────────────────────────────────────────────────────────────────────────

-- Normalized join table; cascade deletes keep everything tidy
CREATE TABLE transaction_tags (
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    tag_id         UUID NOT NULL REFERENCES tags(id)         ON DELETE CASCADE,
    PRIMARY KEY (transaction_id, tag_id)
);
