// database.js
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

let sequelize;

async function initDB() {
  try {
    // Try connecting to MySQL (Railway or local)
    sequelize = new Sequelize(
      process.env.MYSQL_DATABASE,
      process.env.MYSQLUSER,
      process.env.MYSQLPASSWORD,
      {
        host: process.env.MYSQLHOST,
        dialect: "mysql",
        port: process.env.MYSQLPORT || 3306,
        logging: false,
      }
    );

    await sequelize.authenticate();
    console.log("✅ Connected to MySQL database via Sequelize!");
  } catch (mysqlError) {
    console.error("❌ MySQL connection failed:", mysqlError.message);
    console.log("⚠️ Falling back to SQLite in-memory database...");

    // Setup fallback to SQLite
    sequelize = new Sequelize("sqlite::memory:", {
      logging: false,
    });

    try {
      await sequelize.authenticate();
      console.log("✅ Connected to SQLite in-memory database.");
    } catch (sqliteError) {
      console.error("❌ SQLite fallback failed:", sqliteError.message);
      process.exit(1);
    }
  }
}

await initDB(); // ✅ Ensures async runs before exporting

export default sequelize;
