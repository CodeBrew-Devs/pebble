use std::sync::Arc;

use axum::{
    extract::FromRequestParts,
    http::{header, request::Parts},
};
use uuid::Uuid;

use crate::{auth::jwt::verify_token, error::AppError, state::AppState};

pub struct AuthUser {
    pub user_id: Uuid,
}

impl FromRequestParts<Arc<AppState>> for AuthUser {
    type Rejection = AppError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &Arc<AppState>,
    ) -> Result<Self, Self::Rejection> {
        let auth_header = parts
            .headers
            .get(header::AUTHORIZATION)
            .and_then(|v| v.to_str().ok())
            .ok_or(AppError::Unauthorized)?;

        let token = auth_header
            .strip_prefix("Bearer ")
            .ok_or(AppError::Unauthorized)?;

        let claims = verify_token(token, &state.config.jwt_secret)?;
        Ok(AuthUser {
            user_id: claims.sub,
        })
    }
}
