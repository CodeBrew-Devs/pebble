use sqlx::PgPool;

use crate::config::Config;

pub struct AppState {
    pub pool: PgPool,
    pub config: Config,
}
