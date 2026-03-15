pub mod auth;
pub mod transactions;
pub mod user;

use std::sync::Arc;

use axum::{extract::State, Json};
use serde::Serialize;
use serde_json::{json, Value};

use crate::{error::AppError, state::AppState};

pub async fn health(State(state): State<Arc<AppState>>) -> Result<Json<Value>, AppError> {
    sqlx::query("SELECT 1").execute(&state.pool).await?;
    Ok(Json(json!({ "status": "ok" })))
}

pub fn ok<T: Serialize>(data: T) -> Json<Value> {
    Json(json!({ "data": data }))
}

pub fn ok_msg<T: Serialize>(data: T, message: &str) -> Json<Value> {
    Json(json!({ "data": data, "message": message }))
}
