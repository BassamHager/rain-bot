const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { DefaultEmbed, ErrorEmbed, SuccessEmbed } = require("../../../embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "remove-role",
      enabled: true,
      data: new SlashCommandBuilder()
        .setName("remove-role")
        .setDescription("Remove Role")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addRoleOption((role) =>
          role.setName("role").setDescription("Role").setRequired(true)
        ),
    });
  }
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: false });

    const role = interaction.options.getRole("role");

    const { roles } = await this.client.plugins.default.getSettings(
      interaction.guild.id
    );

    if (!roles.find((r) => r.roleId === role.id))
      return await interaction.editReply({
        embeds: [new ErrorEmbed("You don't have that role setup.")],
      });

    await this.client.plugins.default.removeRole(interaction.guild.id, role.id);

    await interaction.editReply({
      embeds: [new SuccessEmbed(`Successfully removed role ${role}.`)],
    });
  }
};
