const Database = require("./config/Database");

async function connectDB() {
  const db = Database.getInstance();
  await db.connect();
}

module.exports = { connectDB };