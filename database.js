import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

let sequelize;

try {
  // Connect to MySQL using Railway environment variables
  sequelize = new Sequelize(
    process.env.MYSQL_DB,
    process.env.MYSQL_USER,
    process.env.MYSQL_PASSWORD,
    {
      host: process.env.MYSQL_HOST,
      dialect: "mysql",
      port: process.env.MYSQL_PORT || 3306,
      logging: false,
    }
  );

  await sequelize.authenticate();
  console.log("✅ Connected to MySQL database via Sequelize!");
} catch (mysqlError) {
  console.error("❌ MySQL connection failed:", mysqlError.message);
  console.log("⚠️ Falling back to SQLite in-memory database...");

  try {
    sequelize = new Sequelize("sqlite::memory:", {
      logging: false,
    });

    await sequelize.authenticate();
    console.log("✅ Connected to SQLite in-memory database.");
  } catch (sqliteError) {
    console.error("❌ SQLite fallback failed:", sqliteError.message);
    process.exit(1);
  }
}

export default sequelize;

// const sequelize = new Sequelize(
//   process.env.MYSQL_DB,
//   process.env.MYSQL_USER,
//   process.env.MYSQL_PASSWORD,
//   {
//     dialect: "mysql",
//     host: process.env.MYSQL_HOST,
//     port: process.env.MYSQL_PORT || 3306,
//     logging: false,
//   }
// );