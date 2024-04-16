const express = require("express");
const { User } = require("../models/User");

class APIServer {
  constructor(client) {
    this.client = client;
    this.app = express();
    this.apiKey = process.env.API_KEY;

    this.app.get("/api/users", async (req, res) => {
      const apiKey = req.query.apiKey;
      if (apiKey !== process.env.API_KEY)
        return res.json({ status: 403, message: "Invalid API key." });
      let data = await User.find().lean();
      res.json({ status: 200, data });
    });

    this.app.get("/api/users/:id", async (req, res) => {
      const apiKey = req.query.apiKey;
      if (apiKey !== process.env.API_KEY)
        return res.json({ status: 403, message: "Invalid API key." });
      const userId = req.params.id;
      let data = await this.client.plugins.default.getData(userId);
      res.json({ status: 200, data });
    });
  }

  async run() {
    this.app.listen(process.env.API_PORT, async function () {
      console.log(
        `\n[API Server] Listening on port ${process.env.API_PORT}!\n`
      );
    });
  }
}

module.exports = { APIServer };
