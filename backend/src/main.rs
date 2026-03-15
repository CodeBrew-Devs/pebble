use std::sync::Arc;

use axum::{
    routing::{get, post},
    Router,
};
use tower_http::{cors::{Any, CorsLayer}, trace::TraceLayer};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod auth;
mod config;
mod db;
mod error;
mod handlers;
mod models;
mod state;

use state::AppState;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenvy::dotenv().ok();

    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "pebble_backend=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let config = config::Config::from_env()?;
    let port = config.server_port;

    let pool = db::create_pool(&config).await?;
    sqlx::migrate!("./migrations").run(&pool).await?;

    let state = Arc::new(AppState { pool, config });

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/auth/signup", post(handlers::auth::signup))
        .route("/auth/login", post(handlers::auth::login))
        .route("/user", get(handlers::user::get_user))
        .route("/user/onboarding", post(handlers::user::onboarding))
        .with_state(state)
        .layer(cors)
        .layer(TraceLayer::new_for_http());

    let addr = format!("0.0.0.0:{port}");
    tracing::info!("listening on {addr}");
    let listener = tokio::net::TcpListener::bind(&addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}
