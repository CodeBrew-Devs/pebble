use chrono::{DateTime, NaiveDate, Utc};
use rust_decimal::Decimal;
use serde::Serialize;
use sqlx::FromRow;
use uuid::Uuid;

/// Raw DB row returned by queries that join tags via `array_agg`.
#[derive(Debug, FromRow)]
#[allow(dead_code)]
pub struct TransactionRow {
    pub id: Uuid,
    pub account_id: Uuid,
    pub user_id: Uuid,
    pub name: String,
    pub amount: Decimal,
    pub date: NaiveDate,
    pub category: Option<String>,
    pub created_at: DateTime<Utc>,
    /// Tag names aggregated from the LEFT JOIN; empty vec when no tags.
    pub tag_names: Vec<String>,
}

/// Serialized shape sent to the frontend.
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TransactionResponse {
    pub id: Uuid,
    pub name: String,
    pub amount: Decimal,
    pub date: NaiveDate,
    pub category: Option<String>,
    pub tags: Vec<String>,
    pub created_at: DateTime<Utc>,
}

impl From<TransactionRow> for TransactionResponse {
    fn from(r: TransactionRow) -> Self {
        TransactionResponse {
            id: r.id,
            name: r.name,
            amount: r.amount,
            date: r.date,
            category: r.category,
            tags: r.tag_names,
            created_at: r.created_at,
        }
    }
}
