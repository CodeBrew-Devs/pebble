use std::sync::Arc;

use axum::{extract::State, Json};
use serde::Deserialize;
use serde_json::Value;

use crate::{
    auth::{
        jwt::create_token,
        password::{hash_password, verify_password},
    },
    error::AppError,
    models::user::{User, UserResponse},
    state::AppState,
};

use super::ok;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SignupRequest {
    pub first_name: String,
    pub last_name: String,
    pub email: String,
    pub password: String,
}

#[derive(Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

pub async fn signup(
    State(state): State<Arc<AppState>>,
    Json(req): Json<SignupRequest>,
) -> Result<Json<Value>, AppError> {
    let password_hash = hash_password(&req.password)?;

    let user = sqlx::query_as::<_, User>(
        r#"
        INSERT INTO users (first_name, last_name, email, password_hash)
        VALUES ($1, $2, $3, $4)
        RETURNING *
        "#,
    )
    .bind(&req.first_name)
    .bind(&req.last_name)
    .bind(&req.email)
    .bind(&password_hash)
    .fetch_one(&state.pool)
    .await
    .map_err(|e| match &e {
        sqlx::Error::Database(db_err) if db_err.code().as_deref() == Some("23505") => {
            AppError::Conflict("email already registered".to_string())
        }
        _ => AppError::Sqlx(e),
    })?;

    let token = create_token(user.id, &state.config.jwt_secret, state.config.jwt_expiry_hours)?;
    let user_resp = UserResponse::from(user);

    Ok(ok(serde_json::json!({ "token": token, "user": user_resp })))
}

pub async fn login(
    State(state): State<Arc<AppState>>,
    Json(req): Json<LoginRequest>,
) -> Result<Json<Value>, AppError> {
    // Return 401 regardless of whether email exists (don't reveal "not found")
    let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE email = $1")
        .bind(&req.email)
        .fetch_optional(&state.pool)
        .await?
        .ok_or(AppError::Unauthorized)?;

    verify_password(&req.password, &user.password_hash)?;

    let token = create_token(user.id, &state.config.jwt_secret, state.config.jwt_expiry_hours)?;
    let user_resp = UserResponse::from(user);

    Ok(ok(serde_json::json!({ "token": token, "user": user_resp })))
}
