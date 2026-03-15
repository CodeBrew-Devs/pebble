use serde::Deserialize;

#[derive(Deserialize, Clone, Debug)]
pub struct Config {
    pub database_url: String,
    pub jwt_secret: String,
    #[serde(default = "default_expiry")]
    pub jwt_expiry_hours: u64,
    #[serde(default = "default_port")]
    pub server_port: u16,
}

fn default_expiry() -> u64 {
    168
}

fn default_port() -> u16 {
    3000
}

impl Config {
    pub fn from_env() -> Result<Self, envy::Error> {
        envy::from_env()
    }
}
