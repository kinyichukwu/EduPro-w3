# Database Migrations

This directory contains versioned SQL migrations for the EduPro backend database.

## Migration Files

- `001_initial_schema.sql` - Initial database schema with users, onboarding, and RAG tables
- `002_solana_tables.sql` - Solana-related tables for wallets, rewards, courses, purchases, and staking

## Running Migrations

To run migrations manually:

```bash
# Run a specific migration
psql $DATABASE_URL -f migrations/001_initial_schema.sql
psql $DATABASE_URL -f migrations/002_solana_tables.sql

# Or run all migrations in order
for file in migrations/*.sql; do
    echo "Running migration: $file"
    psql $DATABASE_URL -f "$file"
done
```

## Migration Naming Convention

Migrations should be named with a 3-digit prefix followed by a descriptive name:
- `001_initial_schema.sql`
- `002_solana_tables.sql`
- `003_add_user_preferences.sql`

## Best Practices

1. Always use `IF NOT EXISTS` for CREATE statements
2. Include proper indexes for performance
3. Add comments describing the purpose of each migration
4. Test migrations on a copy of production data before applying
5. Keep migrations idempotent (safe to run multiple times)

