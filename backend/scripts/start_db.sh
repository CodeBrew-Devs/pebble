#!/usr/bin/env bash
set -euo pipefail

CONTAINER_NAME=pebble-postgres
DB_USER=pebble
DB_PASS=pebble_dev
DB_NAME=pebble
HOST_PORT=5432

if podman ps -a --format "{{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
  echo "Container ${CONTAINER_NAME} already exists, starting..."
  podman start "${CONTAINER_NAME}"
else
  echo "Creating ${CONTAINER_NAME}..."
  podman run -d \
    --name "${CONTAINER_NAME}" \
    -e POSTGRES_USER="${DB_USER}" \
    -e POSTGRES_PASSWORD="${DB_PASS}" \
    -e POSTGRES_DB="${DB_NAME}" \
    -p "${HOST_PORT}:5432" \
    postgres:16-alpine
fi

echo "Waiting for PostgreSQL to be ready..."
until podman exec "${CONTAINER_NAME}" pg_isready -U "${DB_USER}" -d "${DB_NAME}" > /dev/null 2>&1; do
  sleep 1
done

echo "PostgreSQL is ready at localhost:${HOST_PORT}"
echo "DATABASE_URL=postgres://${DB_USER}:${DB_PASS}@localhost:${HOST_PORT}/${DB_NAME}"
