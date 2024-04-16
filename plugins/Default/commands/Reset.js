const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { SuccessEmbed } = require("../../../embeds");
const { PermissionFlagsBits } = require("discord.js");
const { User } = require("../../../models/User");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "reset",
      enabled: true,
      data: new SlashCommandBuilder()
        .setName("reset")
        .setDescription("Reset")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addNumberOption((num) =>
          num
            .setName("loss-percent")
            .setDescription("Loss Percent 1-100")
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(100)
        ),
    });
  }
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: false });

    const percent = interaction.options.getNumber("loss-percent");

    const users = await User.find({});
    for (const user of users) {
      if (percent === 100) {
        user.marks = 0;
        user.expirations = [];
      } else {
        user.marks = parseInt(user.marks / Math.floor(100 / percent));
        user.expirations = [];
      }
      await user.save();
    }

    await interaction.editReply({
      embeds: [new SuccessEmbed(`Database has been resetted!`)],
    });
  }
};
