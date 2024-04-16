const { Schema, model } = require("mongoose");

const expiration = new Schema({
  amount: {
    type: Number,
    default: 0,
  },
  expires: {
    type: Number,
    default: 0,
  },
  reason: {
    type: String,
  },
});

const user = new Schema({
  userId: String,
  marks: {
    type: Number,
    default: 0,
  },
  expirations: [expiration],
});

const User = model("user", user);

module.exports = { User };
