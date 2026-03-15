# pebble.

> _Drop a pebble. Watch your savings ripple._

![React](https://img.shields.io/badge/React_19-20232A?style=flat&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![Rust](https://img.shields.io/badge/Rust-000000?style=flat&logo=rust&logoColor=white)
![Axum](https://img.shields.io/badge/Axum-orange?style=flat)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)

A full-stack, mobile-first budgeting web app with a React + TypeScript frontend and a Rust/Axum REST API backend. Built from scratch — including a custom auth system — to help first-time budgeters understand their spending without the overwhelm.

**[Live Demo](#)** · **[Frontend](./frontend)** · **[Backend](./backend)**

---

## Overview

Most budgeting tools are built for people who already know how to budget. Pebble is built for everyone else — the person who gets paid, watches their account drain, and has no idea where it went.

The core model is simple: every dollar of income gets split across three buckets — **Needs**, **Wants**, and **Savings** — using a starting split suggested by the user's own goals (e.g. 50/30/20). Transactions are categorized, tagged, and surfaced through a dashboard that keeps goals visible and progress motivating.

---

## Technical Highlights

- **Rust + Axum backend** — high-performance async REST API over HTTP/2, chosen for memory safety and throughput
- **Self-rolled authentication** — Argon2 password hashing + JWT session tokens, with no third-party auth dependency
- **Type-safe across the stack** — shared domain types in TypeScript (frontend) mirror the Rust structs on the backend; no `any` in the codebase
- **Server state management** — TanStack Query v5 handles all data fetching, caching, and background refetching; no Redux or global state
- **Relational data model** — PostgreSQL schema with a normalized `transaction_tags` join table, enabling flexible tag management with referential integrity
- **Mobile-first UI** — layouts designed at 375px and scaled up; CSS Modules for zero-runtime, scoped styling
- **Custom design system** — full brand style guide with design tokens, component specs, typography scale, and motion guidelines

---

## Features

### Auth
- Email + password signup and login
- Passwords hashed with **Argon2** (winner of the Password Hashing Competition)
- Stateless sessions via **JWT** — all routes require a valid token
- User data is fully scoped — no cross-account data leakage

### Onboarding Flow
A guided multi-step flow on first login that collects:
1. **Budget goals** — emergency fund, vacation, purchase, investing, debt payoff, or just exploring
2. **Income** — entered as daily / weekly / bi-weekly / monthly / annual and normalized to a monthly baseline
3. **Starting budget split** — Pebble suggests a Needs / Wants / Savings percentage breakdown based on the user's goals

### Dashboard
- Visual budget split (Needs / Wants / Savings) with category totals
- Goal cards with animated progress fills — framed encouragingly, not numerically
  - Savings: _"Halfway there! Your emergency fund is growing."_
  - Debt: _"Only $3,000 left until you're debt-free."_
- Income baseline computed from any entry frequency

### Transactions
- Log income or expenses with category and optional tags
- Search and filter transaction history
- Uncategorized transactions are surfaced proactively: _"Quick — where does this one go?"_

### Tags
- Reusable labels (e.g. `subscription`, `dining`) applied per transaction
- Cascade delete: removing a tag cleans it from all tagged transactions

---

## Tech Stack

### Frontend
| Layer | Choice | Why |
|---|---|---|
| Framework | React 19 + TypeScript | Industry standard; strict typing catches bugs at compile time |
| Build tool | Vite 7 | Sub-second HMR; fast production builds via Rollup |
| Routing | React Router v7 | File-based routing with nested layout support |
| Server state | TanStack Query v5 | Declarative data fetching, caching, and background sync without a global store |
| HTTP client | Axios | Interceptor support for attaching JWT headers globally |
| Styling | CSS Modules | Zero-runtime, locally scoped styles — no class name collisions |
| Icons | Lucide React | Consistent 24px stroke icon set, tree-shakeable |
| Fonts | Fraunces + DM Sans | Self-hosted via `@fontsource` — no external font requests at runtime |

### Backend
| Layer | Choice | Why |
|---|---|---|
| Language | Rust | Memory safety without a GC; compile-time guarantees for correctness |
| Framework | Axum | Ergonomic tower-based middleware; async-native with Tokio |
| Protocol | HTTP/2 | Multiplexed requests; lower latency under load |
| Database | PostgreSQL 16 | ACID compliance; powerful relational model for financial data |
| Query layer | sqlx | Compile-time checked SQL queries; no ORM magic hiding N+1s |
| Auth | Argon2 + jsonwebtoken | Argon2id is the current best-practice KDF; stateless JWT avoids session storage |

---

## Architecture

```
┌─────────────────────────┐        ┌──────────────────────────┐
│     React Frontend      │        │      Axum Backend        │
│                         │        │                          │
│  TanStack Query         │◄──────►│  Route handlers          │
│  Axios (JWT headers)    │  HTTP/2│  sqlx (typed SQL)        │
│  React Router           │        │  Argon2 + JWT auth       │
│  CSS Modules            │        │  PostgreSQL              │
└─────────────────────────┘        └──────────────────────────┘
```

**Key design decisions:**
- Auth is self-rolled (not Firebase/Auth0) to demonstrate end-to-end security implementation
- TanStack Query is the only "state manager" — server state and local UI state are kept deliberately separate
- CSS Modules over Tailwind to keep styling explicit and co-located with components
- Rust was chosen over Node for the backend to explore performance and safety tradeoffs in a financial context

---

## REST API

Base URL: `http://localhost:3000`

All endpoints except `/auth/*` require an `Authorization: Bearer <token>` header.

### Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/signup` | — | Register a new user |
| `POST` | `/auth/login` | — | Log in, receive JWT |

### User
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/user` | ✓ | Get current user profile |
| `POST` | `/user/onboarding` | ✓ | Submit onboarding data (goals, income, budget split) |

### Transactions _(planned)_
| Method | Path | Description |
|---|---|---|
| `GET` | `/transactions` | List all transactions |
| `POST` | `/transactions` | Create a transaction |
| `PATCH` | `/transactions/:id` | Update category or tags |
| `DELETE` | `/transactions/:id` | Delete a transaction |

### Tags _(planned)_
| Method | Path | Description |
|---|---|---|
| `GET` | `/tags` | List all tags |
| `POST` | `/tags` | Create a tag |
| `DELETE` | `/tags/:tag_id` | Delete a tag (cascades off all transactions) |

---

## Database Schema

```sql
users              (id, first_name, last_name, email, password_hash,
                    goals, income_amount, income_frequency,
                    budget_needs, budget_wants, budget_savings,
                    onboarding_completed_at, created_at)
accounts           (id, user_id, created_at)
transactions       (id, account_id, user_id, name, amount, date, category, created_at)
tags               (id, user_id, name)
transaction_tags   (transaction_id, tag_id)   -- normalized join table
```

---

## Project Structure

```
pebble/
├── frontend/                   # React + TypeScript (Vite)
│   └── src/
│       ├── components/         # Reusable UI: Button, Input, CategoryTag, AppLayout
│       ├── context/            # AuthContext — JWT storage + current user
│       ├── lib/                # Axios instance with auth interceptor
│       ├── pages/              # Route-level views
│       │   ├── Login/
│       │   ├── Signup/
│       │   ├── Onboarding/     # Multi-step goal + income collection
│       │   ├── Dashboard/      # Budget split + goal cards
│       │   ├── Transactions/
│       │   └── Profile/
│       ├── styles/             # Global CSS variables (design tokens)
│       └── types/              # Shared domain types (User, Transaction, Goal, etc.)
└── backend/                    # Axum REST API (Rust)
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- Rust (stable) — https://rust-lang.org/tools/install/
- Podman — https://podman.io/docs/installation
- PostgreSQL 16 (started via the provided script)

### Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### Backend

```bash
cd backend
bash scripts/start_db.sh   # starts a postgres:16 container on port 5432
cp .env.example .env       # then set JWT_SECRET to a real random string
cargo run
# → http://localhost:3000
```

See [`backend/README.md`](./backend/README.md) for full setup details and curl examples.

---

## Design System

A full brand style guide is included at [`pebble-style-guide.html`](./pebble-style-guide.html), covering:

- **Color tokens** — sage greens, warm stone neutrals, semantic category colors
- **Typography scale** — Fraunces (display) + DM Sans (UI), 9 named tokens from `display-xl` to `overline`
- **Spacing** — 4px base grid, 10-stop scale
- **Components** — buttons, inputs, cards, tags, goal cards with spec
- **Motion** — 5 named duration/easing tokens; all under 400ms
- **Voice & tone** — copy guidelines with do/don't examples

---


## Team

| Role | Name | GitHub |
|---|---|---|
| Frontend | Raymond Sotto | [@raymondjosephsotto](https://github.com/raymondjosephsotto) |
| Backend | Jake Arnquist | [@arnquic](https://github.com/arnquic) |

---

## License

MIT
