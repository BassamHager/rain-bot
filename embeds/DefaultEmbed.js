const { EmbedBuilder } = require("discord.js");
const { color } = require("../config.js");

class DefaultEmbed extends EmbedBuilder {
  constructor(data) {
    super(data);
    this.data.color = parseInt(color);
  }
}

module.exports = DefaultEmbed;
