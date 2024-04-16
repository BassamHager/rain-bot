const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { DefaultEmbed } = require("../../../embeds");
const { User } = require("../../../models/User");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "leaderboard",
      enabled: true,
      data: new SlashCommandBuilder()
        .setName("leaderboard")
        .setDescription("Leaderboard"),
    });
  }
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: false });

    let top10 = (await User.find().lean())
      .filter((u) => this.client.users.cache.get(u.userId) && u.marks > 0)
      .sort((a, b) => b.marks - a.marks)
      .slice(0, 10);

    const embed = new DefaultEmbed()
      .setTitle("🏆 Leaderboard")
      .setDescription(
        top10
          .map(
            (u, index) =>
              `\`#${++index}\` <@${
                u.userId
              }>: 🔥 ${u.marks.toLocaleString()} Firebrand Marks`
          )
          .join("\n") || "No data found!"
      );

    await interaction.editReply({ embeds: [embed] });
  }
};
