const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { DefaultEmbed } = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "role-list",
      enabled: true,
      data: new SlashCommandBuilder()
        .setName("role-list")
        .setDescription("Role List"),
    });
  }
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: false });

    let { roles } = await this.client.plugins.default.getSettings(
      interaction.guild.id
    );
    roles = roles.filter((r) => interaction.guild.roles.cache.get(r.roleId));

    const embed = new DefaultEmbed()
      .setTitle("⭐ Role Rewards")
      .setDescription(
        `${
          roles
            .map(
              (r) => `<@&${r.roleId}>: 🔥 ${r.requiredMarks} Firebrand Marks`
            )
            .join("\n") || "No data found!"
        }`
      );
    await interaction.editReply({ embeds: [embed] });
  }
};
