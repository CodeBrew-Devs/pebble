# Pebble Backend

Rust/Axum API server for the Pebble budgeting app. Runs on `http://localhost:3000`.

---

## Prerequisites

### Rust

Install via the [Rust installation guide](https://rust-lang.org/tools/install/)

Verify:

```bash
rustc --version
cargo --version
```

### Podman (for the database)

Install via the [Podman installation guide](https://podman.io/docs/installation).

On macOS with Homebrew:

```bash
brew install podman
podman machine init
podman machine start
```

---

## Setup

### 1. Start the database

```bash
bash scripts/start_db.sh
```

This starts a PostgreSQL 16 container named `pebble-postgres` on port `5432`. If the container already exists, it just starts it.

### 2. Configure environment

Copy the example env file and fill in a real JWT secret:

```bash
cp .env.example .env
```

Edit `.env`:

```dotenv
DATABASE_URL=postgres://pebble:pebble_dev@localhost:5432/pebble
JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRY_HOURS=168
SERVER_PORT=3000
RUST_LOG=pebble_backend=debug,tower_http=debug
```

### 3. Run the server

```bash
cargo run
```

Database migrations are applied automatically on startup. The server listens on `http://localhost:3000`.

---

## API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/auth/signup` | — | Create account |
| `POST` | `/auth/login` | — | Log in |
| `GET` | `/user` | Bearer token | Get current user |
| `POST` | `/user/onboarding` | Bearer token | Complete onboarding |
| `GET` | `/transactions` | Bearer token | List transactions (newest first) |
| `POST` | `/transactions` | Bearer token | Create a transaction |
| `PATCH` | `/transactions/{id}` | Bearer token | Update category / tags |
| `DELETE` | `/transactions/{id}` | Bearer token | Delete a transaction |

All responses are wrapped as `{ "data": ... }`. Errors return `{ "error": "..." }` with an appropriate HTTP status code.

The `amount` field must be sent as a decimal string (e.g. `"-42.50"`), not a JSON number, to preserve financial precision.

### Signup

```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Alex","lastName":"Johnson","email":"alex@example.com","password":"password123"}'
```

### Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alex@example.com","password":"password123"}'
```

### Get user (protected)

```bash
curl http://localhost:3000/user \
  -H "Authorization: Bearer <token>"
```

### Onboarding (protected)

```bash
curl -X POST http://localhost:3000/user/onboarding \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "goals": ["emergency", "vacation"],
    "incomeAmount": "5200",
    "incomeFrequency": "monthly",
    "budgetSplit": { "needs": 50, "wants": 30, "savings": 20 }
  }'
```

### Transactions

**List:**

```bash
curl http://localhost:3000/transactions \
  -H "Authorization: Bearer <token>"
```

**Create:**

```bash
curl -X POST http://localhost:3000/transactions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Grocery run",
    "amount": "-67.40",
    "date": "2026-03-15",
    "category": "needs",
    "tagIds": ["<uuid>"]
  }'
```

**Update (category / tags):**

```bash
curl -X PATCH http://localhost:3000/transactions/<id> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"category": "wants", "tagIds": []}'
```

**Delete:**

```bash
curl -X DELETE http://localhost:3000/transactions/<id> \
  -H "Authorization: Bearer <token>"
```
