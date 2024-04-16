const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { DefaultEmbed, ErrorEmbed, SuccessEmbed } = require("../../../embeds"); // @todo: unused var
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "add-role",
      enabled: true,
      data: new SlashCommandBuilder()
        .setName("add-role")
        .setDescription("Add Role")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addRoleOption((role) =>
          role.setName("role").setDescription("Role").setRequired(true)
        )
        .addNumberOption((num) =>
          num
            .setName("required-marks")
            .setMinValue(1)
            .setDescription("Required amount of marks")
            .setRequired(true)
        ),
    });
  }
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: false });

    const role = interaction.options.getRole("role");
    const amount = interaction.options.getNumber("required-marks");

    if (role.id === interaction.guild.roles.everyone.id)
      return await interaction.editReply({
        embeds: [new ErrorEmbed("You cannot set @everyone role.")],
      });

    const { roles } = await this.client.plugins.default.getSettings(
      interaction.guild.id
    );

    if (roles.find((r) => r.roleId === role.id))
      return await interaction.editReply({
        embeds: [new ErrorEmbed("You already have that role.")],
      });

    await this.client.plugins.default.addRole(
      interaction.guild.id,
      role.id,
      amount
    );

    await interaction.editReply({
      embeds: [
        new SuccessEmbed(
          `Successfully added role ${role}
          for 🔥 **${amount}** Firebrand Marks.`
        ),
      ],
    });
  }
};
