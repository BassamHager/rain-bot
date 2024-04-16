const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { DefaultEmbed, ErrorEmbed, SuccessEmbed } = require("../../../embeds");
const { PermissionFlagsBits } = require("discord.js");
const { logsChannel } = require("../../../config");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "remove-marks",
      enabled: true,
      data: new SlashCommandBuilder()
        .setName("remove-marks")
        .setDescription("Remove Firebrand Marks")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
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
          str.setName("reason").setDescription("Reason").setRequired(false)
        ),
    });
  }
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: false });

    const user = interaction.options.getUser("user");
    const amount = interaction.options.getNumber("amount");
    const reason =
      interaction.options.getString("reason", false) || "No reason";

    const data = await this.client.plugins.default.getData(user.id);

    const neverExpires = data.expirations.filter((e) => e.expires === -1);

    let totalNeverExpires = 0;

    if (neverExpires.length)
      totalNeverExpires = neverExpires.reduce((curr, a) => curr + a.amount, 0);

    if (amount > totalNeverExpires)
      return await interaction.editReply({
        embeds: [new ErrorEmbed("You can't remove more than user has!")],
      });

    await this.client.plugins.default.removeMarks(user.id, amount);

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
              value: `-${amount.toLocaleString()}`,
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
          `Successfully removed 🔥 **${amount.toLocaleString()}** Firebrand Marks. \n💬 Reason: \`${reason}\``
        ),
      ],
    });
  }
};
