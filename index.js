require("dotenv/config");

const Client = require("./structures/Client");
const client = new Client();

const mongoose = require("mongoose");

mongoose.set("strictQuery", true);
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log(`\n[Database] Connected to ${process.env.MONGO_URI}\n`);
    await client.start();
  })
  .catch((err) => console.log("===>", err));

String.prototype.toTitleCase = function () {
  return this[0].toUpperCase() + this.slice(1).toLowerCase();
};
