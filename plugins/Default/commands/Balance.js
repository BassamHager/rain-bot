const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { DefaultEmbed } = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "balance",
      enabled: true,
      data: new SlashCommandBuilder()
        .setName("balance")
        .setDescription("Check Balance")
        .addUserOption((user) =>
          user.setName("user").setDescription("User").setRequired(false)
        ),
    });
  }
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: false });

    const user = interaction.options.getUser("user") || interaction.user;

    const { marks, expirations } = await this.client.plugins.default.getData(
      user.id
    );

    let filtered = expirations.filter((x) => x.expires === -1);
    let neverExpires = 0;

    for (const f of filtered) {
      neverExpires += f.amount;
    }

    const embed = new DefaultEmbed()
      .setAuthor({
        name: user.username,
        iconURL: user.displayAvatarURL({ dynamic: true }),
      })
      .setDescription(
        `${user} has 🔥 **${marks.toLocaleString()}** total Firebrand Marks! \n\n⏰ **Expirations:** \n
> 🔥 **${neverExpires.toLocaleString()}** Never Expires
> ${
          expirations
            .filter((x) => x.expires !== -1 && x.amount > 0)
            .map(
              (e) =>
                `🔥 **${e.amount.toLocaleString()}** ${`<t:${Math.floor(
                  e.expires / 1000
                )}:R>`}`
            )
            .join("\n> ") || "\0"
        }`
      );
    await interaction.editReply({ embeds: [embed] });
  }
};
