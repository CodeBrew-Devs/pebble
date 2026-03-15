use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};

use crate::error::AppError;

pub fn hash_password(password: &str) -> Result<String, AppError> {
    let salt = SaltString::generate(&mut OsRng);
    let hash = Argon2::default()
        .hash_password(password.as_bytes(), &salt)
        .map_err(|e| AppError::Internal(e.to_string()))?;
    Ok(hash.to_string())
}

pub fn verify_password(password: &str, hash: &str) -> Result<(), AppError> {
    let parsed_hash =
        PasswordHash::new(hash).map_err(|e| AppError::Internal(e.to_string()))?;
    Argon2::default()
        .verify_password(password.as_bytes(), &parsed_hash)
        .map_err(|_| AppError::Unauthorized)
}
