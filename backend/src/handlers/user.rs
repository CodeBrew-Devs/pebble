use std::sync::Arc;

use axum::{extract::State, Json};
use rust_decimal::Decimal;
use serde::Deserialize;
use serde_json::Value;

use crate::{
    auth::extractor::AuthUser,
    error::AppError,
    models::user::{User, UserResponse},
    state::AppState,
};

use super::ok;

pub async fn get_user(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
) -> Result<Json<Value>, AppError> {
    let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = $1")
        .bind(auth.user_id)
        .fetch_optional(&state.pool)
        .await?
        .ok_or(AppError::NotFound)?;

    Ok(ok(UserResponse::from(user)))
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BudgetSplit {
    pub needs: i32,
    pub wants: i32,
    pub savings: i32,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OnboardingRequest {
    pub goals: Vec<String>,
    pub income_amount: String,
    pub income_frequency: String,
    pub budget_split: BudgetSplit,
}

pub async fn onboarding(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
    Json(req): Json<OnboardingRequest>,
) -> Result<Json<Value>, AppError> {
    let total = req.budget_split.needs + req.budget_split.wants + req.budget_split.savings;
    if total != 100 {
        return Err(AppError::BadRequest(
            "budgetSplit must sum to 100".to_string(),
        ));
    }

    let income_amount: Decimal = req
        .income_amount
        .parse()
        .map_err(|_| AppError::BadRequest("invalid incomeAmount".to_string()))?;

    let user = sqlx::query_as::<_, User>(
        r#"
        UPDATE users SET
            goals             = $1,
            income_amount     = $2,
            income_frequency  = $3,
            budget_needs      = $4,
            budget_wants      = $5,
            budget_savings    = $6,
            onboarding_completed_at = NOW()
        WHERE id = $7
        RETURNING *
        "#,
    )
    .bind(&req.goals)
    .bind(income_amount)
    .bind(&req.income_frequency)
    .bind(req.budget_split.needs)
    .bind(req.budget_split.wants)
    .bind(req.budget_split.savings)
    .bind(auth.user_id)
    .fetch_optional(&state.pool)
    .await?
    .ok_or(AppError::NotFound)?;

    Ok(ok(UserResponse::from(user)))
}
