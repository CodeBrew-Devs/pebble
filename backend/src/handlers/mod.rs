pub mod auth;
pub mod user;

use axum::Json;
use serde::Serialize;
use serde_json::{json, Value};

pub fn ok<T: Serialize>(data: T) -> Json<Value> {
    Json(json!({ "data": data }))
}

pub fn ok_msg<T: Serialize>(data: T, message: &str) -> Json<Value> {
    Json(json!({ "data": data, "message": message }))
}
