const { Schema, model } = require("mongoose");

const role = new Schema({
  roleId: String,
  requiredMarks: Number,
});

const settings = new Schema({
  guildId: String,
  roles: [role],
});

const Settings = model("settings", settings);

module.exports = { Settings };
