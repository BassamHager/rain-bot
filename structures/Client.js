const { Client, IntentsBitField, Partials, Collection } = require("discord.js");
require("dotenv").config();
const { PluginManager } = require("./");
const config = require("../config.js");
const { APIServer } = require("../server/API.js");

module.exports = class extends Client {
  constructor() {
    super({
      intents: new IntentsBitField(3276799),
      partials: [
        Partials.User,
        Partials.GuildMember,
        Partials.Channel,
        Partials.Message,
        Partials.Reaction,
      ],
    });

    this.commands = new Collection();
    this.config = config;
    this.plugins = new PluginManager(this);
    this.api = new APIServer(this);
  }

  async start() {
    await this.plugins.load();
    await this.api.run();
    await super.login(process.env.TOKEN);
  }
};
