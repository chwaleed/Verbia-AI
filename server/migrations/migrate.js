import { readdir, readFile } from "fs/promises";
import { join } from "path";
import sql from "../config/db.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create migrations table to track which migrations have been run
async function createMigrationsTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log("✅ Migrations table created/verified");
  } catch (error) {
    console.error("❌ Error creating migrations table:", error.message);
    throw error;
  }
}

// Get list of executed migrations
async function getExecutedMigrations() {
  try {
    const result =
      await sql`SELECT filename FROM migrations ORDER BY executed_at`;
    return result.map((row) => row.filename);
  } catch (error) {
    console.error("❌ Error getting executed migrations:", error.message);
    return [];
  }
}

// Mark migration as executed
async function markMigrationAsExecuted(filename) {
  try {
    await sql`INSERT INTO migrations (filename) VALUES (${filename})`;
    console.log(`✅ Marked migration as executed: ${filename}`);
  } catch (error) {
    console.error(
      `❌ Error marking migration as executed: ${filename}`,
      error.message
    );
    throw error;
  }
}

// Execute a single migration file
async function executeMigration(migrationPath, filename) {
  try {
    console.log(`🔄 Executing migration: ${filename}`);

    const migrationSQL = await readFile(migrationPath, "utf8");

    // Split the migration file by semicolons and execute each statement
    const statements = migrationSQL
      .split(";")
      .map((statement) => statement.trim())
      .filter(
        (statement) => statement.length > 0 && !statement.startsWith("--")
      );

    for (const statement of statements) {
      if (statement.trim()) {
        await sql.unsafe(statement);
      }
    }

    await markMigrationAsExecuted(filename);
    console.log(`✅ Successfully executed migration: ${filename}`);
  } catch (error) {
    console.error(`❌ Error executing migration ${filename}:`, error.message);
    throw error;
  }
}

// Run all pending migrations
async function runMigrations() {
  try {
    console.log("🚀 Starting database migrations...");

    // Ensure migrations table exists
    await createMigrationsTable();

    // Get list of migration files
    const migrationsDir = join(__dirname, ".");
    const migrationFiles = await readdir(migrationsDir);
    const sqlFiles = migrationFiles
      .filter((file) => file.endsWith(".sql"))
      .sort(); // Sort to ensure migrations run in order

    if (sqlFiles.length === 0) {
      console.log("📝 No migration files found");
      return;
    }

    // Get already executed migrations
    const executedMigrations = await getExecutedMigrations();

    // Find pending migrations
    const pendingMigrations = sqlFiles.filter(
      (file) => !executedMigrations.includes(file)
    );

    if (pendingMigrations.length === 0) {
      console.log("✅ All migrations are up to date");
      return;
    }

    console.log(`📋 Found ${pendingMigrations.length} pending migration(s):`);
    pendingMigrations.forEach((file) => console.log(`   - ${file}`));

    // Execute pending migrations
    for (const migrationFile of pendingMigrations) {
      const migrationPath = join(migrationsDir, migrationFile);
      await executeMigration(migrationPath, migrationFile);
    }

    console.log("🎉 All migrations completed successfully!");
  } catch (error) {
    console.error("💥 Migration failed:", error.message);
    process.exit(1);
  }
}

// Run migrations if this script is called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations();
}

export { runMigrations };
