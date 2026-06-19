# Secrets Inventory

*IMPORTANT: Never commit actual secret values to version control. Use this inventory to track required configurations across environments.*

| Environment Variable | Description | Location Managed | Service |
|----------------------|-------------|------------------|---------|
| `DATABASE_URL` | Postgres connection string | Vault / .env | Backend / Worker |
| `REDIS_URL` | Redis connection string | Vault / .env | Backend / Worker |
| `JWT_SECRET` | Secret key for JWT signing | Vault / .env | Backend |
| `ENCRYPTION_KEY` | Envelope encryption KMS key | Vault / .env | Backend |
| `LLM_API_KEY` | API Key for external LLM (if any) | Vault / .env | ML / Worker |
| `MINIO_ACCESS_KEY` | Object storage access key | Vault / .env | Backend / Worker |
| `MINIO_SECRET_KEY` | Object storage secret | Vault / .env | Backend / Worker |
