# Database Migrations

This folder contains database migration files for the AI-Powered SaaS Platform.

## Overview

The migration system helps you:

- Version control your database schema
- Apply database changes consistently across environments
- Track which changes have been applied
- Rollback changes if needed

## Files

- `migrate.js` - Migration runner utility
- `001_create_creations_table.sql` - Initial migration to create the creations table
- `README.md` - This documentation

## Usage

### Running Migrations

```bash
# Run all pending migrations
npm run migrate

# Alternative: run directly
node migrations/migrate.js
```

### Creating New Migrations

1. Create a new `.sql` file in the migrations folder
2. Use sequential numbering: `002_your_migration_name.sql`
3. Write your SQL commands in the file
4. Run `npm run migrate` to apply

### Example Migration File

```sql
-- Migration: Add new column to creations table
-- Created: 2025-09-14
-- Description: Add category column for better organization

ALTER TABLE creations ADD COLUMN category VARCHAR(50) DEFAULT 'general';

-- Create index for new column
CREATE INDEX IF NOT EXISTS idx_creations_category ON creations(category);
```

## Migration File Naming Convention

- Format: `###_descriptive_name.sql`
- Use leading zeros for proper sorting (001, 002, etc.)
- Use underscores instead of spaces
- Be descriptive but concise

Examples:

- `001_create_creations_table.sql`
- `002_add_user_preferences.sql`
- `003_create_subscriptions_table.sql`

## How It Works

1. **Migrations Table**: A `migrations` table tracks which migrations have been executed
2. **Sequential Execution**: Migrations are run in filename order
3. **Idempotent**: Running migrations multiple times is safe - only pending migrations are executed
4. **Transaction Safety**: Each migration runs in its own transaction

## Database Schema

### Creations Table

The initial migration creates a `creations` table with the following structure:

```sql
CREATE TABLE creations (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    prompt TEXT NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    publish BOOLEAN DEFAULT FALSE,
    likes TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Indexes

- `idx_creations_user_id` - For user-specific queries
- `idx_creations_type` - For filtering by content type
- `idx_creations_publish` - For published content queries
- `idx_creations_created_at` - For ordering by creation date

## Troubleshooting

### Common Issues

1. **Connection Error**: Ensure your `DATABASE_URL` environment variable is set correctly
2. **Permission Error**: Make sure your database user has CREATE and ALTER permissions
3. **Syntax Error**: Check your SQL syntax in migration files

### Checking Migration Status

The migration runner will show you:

- Which migrations have been executed
- Which migrations are pending
- Any errors that occur during migration

### Manual Migration Recovery

If you need to manually mark a migration as executed:

```sql
INSERT INTO migrations (filename) VALUES ('your_migration_file.sql');
```

## Best Practices

1. **Always test migrations** in a development environment first
2. **Backup your database** before running migrations in production
3. **Keep migrations small** and focused on a single change
4. **Use descriptive names** for migration files
5. **Add comments** to explain complex changes
6. **Use IF NOT EXISTS** clauses when creating tables/indexes to make migrations idempotent
