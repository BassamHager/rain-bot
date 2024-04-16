const { Command } = require('../../../structures');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { DefaultEmbed } = require('../../../embeds');

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'ping',
      enabled: true,
      data: new SlashCommandBuilder().setName('ping').setDescription('Ping!'),
    });
  }
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const embed = new DefaultEmbed().setDescription(
      `🏓 Pong! ${this.client.ws.ping}ms`
    );
    await interaction.editReply({ embeds: [embed] });
  }
};
