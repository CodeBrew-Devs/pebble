use std::sync::Arc;

use axum::{
    extract::{Path, State},
    Json,
};
use chrono::NaiveDate;
use rust_decimal::Decimal;
use serde::Deserialize;
use serde_json::Value;
use uuid::Uuid;

use crate::{
    auth::extractor::AuthUser,
    error::AppError,
    models::transaction::{TransactionResponse, TransactionRow},
    state::AppState,
};

use super::ok;

// ─── Reusable SQL fragments ────────────────────────────────────────────────────

/// List all transactions for a user, newest first, with tags aggregated.
const LIST_FOR_USER: &str = r#"
    SELECT
        t.id,
        t.account_id,
        t.user_id,
        t.name,
        t.amount,
        t.date,
        t.category,
        t.created_at,
        COALESCE(
            array_agg(tg.name ORDER BY tg.name) FILTER (WHERE tg.name IS NOT NULL),
            ARRAY[]::TEXT[]
        ) AS tag_names
    FROM transactions t
    LEFT JOIN transaction_tags tt ON tt.transaction_id = t.id
    LEFT JOIN tags tg ON tg.id = tt.tag_id
    WHERE t.user_id = $1
    GROUP BY t.id
    ORDER BY t.date DESC, t.created_at DESC
"#;

/// Fetch a single transaction (must belong to the given user).
const BY_ID: &str = r#"
    SELECT
        t.id,
        t.account_id,
        t.user_id,
        t.name,
        t.amount,
        t.date,
        t.category,
        t.created_at,
        COALESCE(
            array_agg(tg.name ORDER BY tg.name) FILTER (WHERE tg.name IS NOT NULL),
            ARRAY[]::TEXT[]
        ) AS tag_names
    FROM transactions t
    LEFT JOIN transaction_tags tt ON tt.transaction_id = t.id
    LEFT JOIN tags tg ON tg.id = tt.tag_id
    WHERE t.id = $1 AND t.user_id = $2
    GROUP BY t.id
"#;

// ─── GET /transactions ─────────────────────────────────────────────────────────

pub async fn list_transactions(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
) -> Result<Json<Value>, AppError> {
    let rows = sqlx::query_as::<_, TransactionRow>(LIST_FOR_USER)
        .bind(auth.user_id)
        .fetch_all(&state.pool)
        .await?;

    let txs: Vec<TransactionResponse> = rows.into_iter().map(TransactionResponse::from).collect();
    Ok(ok(txs))
}

// ─── POST /transactions ────────────────────────────────────────────────────────

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateTransactionRequest {
    pub name: String,
    /// Decimal string, e.g. "-42.50". Negative = expense, positive = income.
    pub amount: String,
    /// ISO date string, e.g. "2026-03-15".
    pub date: String,
    pub category: Option<String>,
    /// IDs of existing tags to associate; use POST /tags to create new ones.
    pub tag_ids: Option<Vec<Uuid>>,
}

pub async fn create_transaction(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
    Json(req): Json<CreateTransactionRequest>,
) -> Result<Json<Value>, AppError> {
    validate_category(req.category.as_deref())?;

    let name = req.name.trim();
    if name.is_empty() {
        return Err(AppError::BadRequest("name must not be empty".to_string()));
    }

    let amount: Decimal = req
        .amount
        .parse()
        .map_err(|_| AppError::BadRequest("invalid amount".to_string()))?;

    let date = NaiveDate::parse_from_str(&req.date, "%Y-%m-%d")
        .map_err(|_| AppError::BadRequest("invalid date; expected YYYY-MM-DD".to_string()))?;

    let mut tx = state.pool.begin().await?;

    // Lazily create the user's account on first transaction.
    sqlx::query(
        "INSERT INTO accounts (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING",
    )
    .bind(auth.user_id)
    .execute(&mut *tx)
    .await?;

    let account_id: Uuid =
        sqlx::query_scalar("SELECT id FROM accounts WHERE user_id = $1")
            .bind(auth.user_id)
            .fetch_one(&mut *tx)
            .await?;

    let transaction_id: Uuid = sqlx::query_scalar(
        r#"
        INSERT INTO transactions (account_id, user_id, name, amount, date, category)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
        "#,
    )
    .bind(account_id)
    .bind(auth.user_id)
    .bind(name)
    .bind(amount)
    .bind(date)
    .bind(&req.category)
    .fetch_one(&mut *tx)
    .await?;

    if let Some(ref tag_ids) = req.tag_ids {
        insert_tags(&mut tx, transaction_id, tag_ids, auth.user_id).await?;
    }

    tx.commit().await?;

    let row = sqlx::query_as::<_, TransactionRow>(BY_ID)
        .bind(transaction_id)
        .bind(auth.user_id)
        .fetch_one(&state.pool)
        .await?;

    Ok(ok(TransactionResponse::from(row)))
}

// ─── PATCH /transactions/:id ───────────────────────────────────────────────────

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateTransactionRequest {
    /// If present (and a valid category string), updates the category.
    /// To support clearing a category to null, upgrade this field to
    /// `Option<Option<String>>` with a custom deserializer.
    pub category: Option<String>,
    /// If present, replaces the full tag set (use `[]` to clear all tags).
    pub tag_ids: Option<Vec<Uuid>>,
}

pub async fn update_transaction(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
    Path(id): Path<Uuid>,
    Json(req): Json<UpdateTransactionRequest>,
) -> Result<Json<Value>, AppError> {
    validate_category(req.category.as_deref())?;

    let mut tx = state.pool.begin().await?;

    // Verify ownership (and get a row-level lock while we mutate).
    let exists: bool =
        sqlx::query_scalar("SELECT EXISTS(SELECT 1 FROM transactions WHERE id = $1 AND user_id = $2)")
            .bind(id)
            .bind(auth.user_id)
            .fetch_one(&mut *tx)
            .await?;

    if !exists {
        return Err(AppError::NotFound);
    }

    // Update category if the key was sent.
    if req.category.is_some() {
        sqlx::query("UPDATE transactions SET category = $1 WHERE id = $2 AND user_id = $3")
            .bind(&req.category)
            .bind(id)
            .bind(auth.user_id)
            .execute(&mut *tx)
            .await?;
    }

    // Replace tag associations if the key was sent.
    if let Some(ref tag_ids) = req.tag_ids {
        sqlx::query("DELETE FROM transaction_tags WHERE transaction_id = $1")
            .bind(id)
            .execute(&mut *tx)
            .await?;

        insert_tags(&mut tx, id, tag_ids, auth.user_id).await?;
    }

    tx.commit().await?;

    let row = sqlx::query_as::<_, TransactionRow>(BY_ID)
        .bind(id)
        .bind(auth.user_id)
        .fetch_optional(&state.pool)
        .await?
        .ok_or(AppError::NotFound)?;

    Ok(ok(TransactionResponse::from(row)))
}

// ─── DELETE /transactions/:id ──────────────────────────────────────────────────

pub async fn delete_transaction(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
    Path(id): Path<Uuid>,
) -> Result<Json<Value>, AppError> {
    let rows_affected =
        sqlx::query("DELETE FROM transactions WHERE id = $1 AND user_id = $2")
            .bind(id)
            .bind(auth.user_id)
            .execute(&state.pool)
            .await?
            .rows_affected();

    if rows_affected == 0 {
        return Err(AppError::NotFound);
    }

    Ok(ok(serde_json::json!({ "id": id })))
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

fn validate_category(cat: Option<&str>) -> Result<(), AppError> {
    if let Some(c) = cat {
        if !["needs", "wants", "savings"].contains(&c) {
            return Err(AppError::BadRequest(
                "category must be 'needs', 'wants', or 'savings'".to_string(),
            ));
        }
    }
    Ok(())
}

async fn insert_tags(
    tx: &mut sqlx::Transaction<'_, sqlx::Postgres>,
    transaction_id: Uuid,
    tag_ids: &[Uuid],
    user_id: Uuid,
) -> Result<(), AppError> {
    if tag_ids.is_empty() {
        return Ok(());
    }

    // Verify every tag belongs to the authenticated user (dedup-safe count).
    let unique_count = tag_ids
        .iter()
        .collect::<std::collections::HashSet<_>>()
        .len();
    let valid_count: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM tags WHERE id = ANY($1::uuid[]) AND user_id = $2",
    )
    .bind(tag_ids)
    .bind(user_id)
    .fetch_one(&mut **tx)
    .await?;

    if valid_count as usize != unique_count {
        return Err(AppError::BadRequest(
            "one or more tag IDs not found".to_string(),
        ));
    }

    // Single-query bulk insert.
    sqlx::query(
        "INSERT INTO transaction_tags (transaction_id, tag_id)
         SELECT $1, unnest($2::uuid[])
         ON CONFLICT DO NOTHING",
    )
    .bind(transaction_id)
    .bind(tag_ids)
    .execute(&mut **tx)
    .await?;

    Ok(())
}
