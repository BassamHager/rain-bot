const { ErrorEmbed } = require('../../../embeds');
const { Event } = require('../../../structures');
const { ChannelType } = require('discord.js');

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      name: 'interactionCreate',
      enabled: true,
    });
  }
  async run(interaction) {
    if (!interaction.isCommand()) return;
    if (interaction.channel.type === ChannelType.DM) return;
    const command = this.client.commands.get(interaction.commandName);
    if (command) {
      try {
        if (command.permission) {
          const { permissions } =
            await this.client.plugins.moderation.getMemberProfile(
              interaction.guild.id,
              interaction.user.id
            );
          if (!permissions.includes(command.permission))
            return await interaction.reply({
              embeds: [
                new ErrorEmbed({
                  description: `You need permission \`${command.permission}\` to use this command.`,
                }),
              ],
              ephemeral: true,
            });
        }
        await command.execute(interaction);
      } catch (error) {
        console.log(`An error ocurred: ${error.stack}`);
      }
    }
  }
};
