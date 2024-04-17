const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { DefaultEmbed, ErrorEmbed, SuccessEmbed } = require("../../../embeds");
const { PermissionFlagsBits } = require("discord.js");

const ms = require("ms");
const { logsChannel, accessRoleId } = require("../../../config");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "add-marks",
      enabled: true,
      data: new SlashCommandBuilder()
        .setName("add-marks")
        .setDescription("Add Firebrand Marks")
        .addUserOption((user) =>
          user.setName("user").setDescription("User").setRequired(true)
        )
        .addNumberOption((num) =>
          num
            .setName("amount")
            .setMinValue(1)
            .setDescription("Amount")
            .setRequired(true)
        )
        .addStringOption((str) =>
          str
            .setName("expires")
            .setDescription(
              "Expires: s - seconds // m - minutes // h - hours // d - days // -1 for unlimited time"
            )
            .setRequired(true)
        )
        .addStringOption((str) =>
          str.setName("reason").setDescription("Reason").setRequired(false)
        ),
    });
  }
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: false });

    if (
      !interaction.member.roles.cache.has(accessRoleId) &&
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
    )
      return await interaction.editReply({
        embeds: [
          new ErrorEmbed(`You don't have permission to use this command!`),
        ],
      });

    const user = interaction.options.getUser("user");
    const amount = interaction.options.getNumber("amount");
    const expires = interaction.options.getString("expires");
    const reason =
      interaction.options.getString("reason", false) || "No reason";

    let expiresMs;

    if (expires !== "-1") {
      try {
        expiresMs = ms(expires);
      } catch (err) {
        return await interaction.editReply({
          embeds: [new ErrorEmbed("Invalid time format!")],
        });
      }
      if (!expiresMs) return;
    } else expiresMs = -1;

    await this.client.plugins.default.addMarks(
      user.id,
      amount,
      expiresMs === -1 ? expiresMs : Date.now() + expiresMs
    );

    const { roles } = await this.client.plugins.default.getSettings(
      interaction.guild.id
    );

    const { marks } = await this.client.plugins.default.getData(user.id);

    for (const role of roles) {
      if (marks >= role.requiredMarks)
        try {
          await interaction.guild.members.cache
            .get(user.id)
            .roles.add(role.roleId);

          // user.roles.add(role.roleId);
        } catch (err) {
          console.log(err);
        }
    }

    await this.client.channels.cache.get(logsChannel)?.send({
      embeds: [
        new DefaultEmbed()
          .setTitle("Balance Updated")
          .setFields(
            {
              name: "Admin",
              value: `${interaction.user}`,
            },
            {
              name: "User",
              value: `${user}`,
            },
            {
              name: "Amount",
              value: `+${amount.toLocaleString()}`,
            },
            {
              name: "Reason",
              value: `${reason}`,
            }
          )
          .setTimestamp(),
      ],
    });

    await interaction.editReply({
      embeds: [
        new SuccessEmbed(
          `Successfully added 🔥 **${amount.toLocaleString()}** Firebrand Marks. \n⏰ Expires: ${
            expiresMs === -1
              ? "Never"
              : "<t:" + Math.floor((Date.now() + expiresMs) / 1000) + ":R>"
          } \n💬 Reason: \`${reason}\``
        ),
      ],
    });
  }
};
