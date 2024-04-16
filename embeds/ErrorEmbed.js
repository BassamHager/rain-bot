const { EmbedBuilder } = require("discord.js");

class ErrorEmbed extends EmbedBuilder {
  constructor(data) {
    super(data);
    this.data.color = 0xff0000;
    this.data.description = `❌ ${data}`;
  }
}

module.exports = ErrorEmbed;
