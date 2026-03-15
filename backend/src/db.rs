use sqlx::postgres::PgPoolOptions;

use crate::config::Config;

pub async fn create_pool(config: &Config) -> Result<sqlx::PgPool, sqlx::Error> {
    PgPoolOptions::new()
        .max_connections(10)
        .connect(&config.database_url)
        .await
}
