
import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import mysql from "mysql2/promise";
import * as dotenv from "dotenv";

dotenv.config();

async function runMigrations() {
    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl) {
        console.error("❌ DATABASE_URL is not defined in environment variables");
        process.exit(1);
    }

    console.log("🔌 Connecting to database for migrations...");
    console.log(`   URL host: ${dbUrl.split('@')[1]?.split('/')[0] || 'hidden'}`); // Log host for debugging safety

    let connection;
    try {
        connection = await mysql.createConnection(dbUrl);
        const db = drizzle(connection);

        console.log("🚀 Running migrations from './drizzle'...");

        // This will run migrations from the "drizzle" directory in the project root
        await migrate(db, { migrationsFolder: "drizzle" });

        console.log("✅ Migrations completed successfully!");

    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1); // Exit with error to fail the build/start
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

runMigrations();
