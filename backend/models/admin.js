const mongoose = require("mongoose");

const adminSchema = mongoose.Schema({
  email: String,
  password: String,
  name: String,
});

const adminModel = mongoose.model("Admin", adminSchema);
module.exports = adminModel;
