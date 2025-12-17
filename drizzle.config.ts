import { defineConfig } from "drizzle-kit";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required to run drizzle commands");
}

// Auto-detect database type from connection string
const isPostgreSQL = connectionString.startsWith("postgresql://") || connectionString.startsWith("postgres://");
const dialect = isPostgreSQL ? "postgresql" : "mysql";

console.log(`Using ${dialect.toUpperCase()} database`);

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: dialect as "mysql" | "postgresql",
  dbCredentials: {
    url: connectionString,
  },
});
