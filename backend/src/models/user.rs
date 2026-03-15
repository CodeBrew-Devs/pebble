use chrono::{DateTime, Utc};
use rust_decimal::Decimal;
use serde::Serialize;
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, FromRow)]
#[allow(dead_code)]
pub struct User {
    pub id: Uuid,
    pub first_name: String,
    pub last_name: String,
    pub email: String,
    pub password_hash: String,
    pub goals: Option<Vec<String>>,
    pub income_amount: Option<Decimal>,
    pub income_frequency: Option<String>,
    pub budget_needs: Option<i32>,
    pub budget_wants: Option<i32>,
    pub budget_savings: Option<i32>,
    pub onboarding_completed_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UserResponse {
    pub id: Uuid,
    pub first_name: String,
    pub last_name: String,
    pub email: String,
    pub onboarding_completed_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
}

impl From<User> for UserResponse {
    fn from(u: User) -> Self {
        UserResponse {
            id: u.id,
            first_name: u.first_name,
            last_name: u.last_name,
            email: u.email,
            onboarding_completed_at: u.onboarding_completed_at,
            created_at: u.created_at,
        }
    }
}
