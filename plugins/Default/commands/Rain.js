const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { DefaultEmbed, SuccessEmbed, ErrorEmbed } = require("../../../embeds");
const { PermissionFlagsBits } = require("discord.js");
const { User } = require("../../../models/User");
const config = require("../../../config");

const ms = require("ms");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "rain",
      enabled: true,
      data: new SlashCommandBuilder()
        .setName("rain")
        .setDescription("Rain")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addRoleOption((role) =>
          role.setName("role").setDescription("Role").setRequired(true)
        )
        .addNumberOption((num) =>
          num
            .setName("amount")
            .setMinValue(1)
            .setDescription("Amount")
            .setRequired(true)
        )
        .addNumberOption((num) =>
          num
            .setName("percent-to-expire")
            .setDescription("Percent of marks that will expire")
            .setRequired(true)
            .setMinValue(0)
            .setMaxValue(100)
        )
        .addStringOption((str) =>
          str
            .setName("expires")
            .setDescription(
              "Expires: s - seconds // m - minutes // h - hours // d - days // -1 for unlimited time"
            )
            .setRequired(true)
        ),
    });
  }
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const role = interaction.options.getRole("role");
    const amount = interaction.options.getNumber("amount");
    const percent = interaction.options.getNumber("percent-to-expire");
    const expires = interaction.options.getString("expires");

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

    const members = (await interaction.guild.members.fetch()).filter(
      (m) => !m.user.bot && m.roles.cache.has(role.id)
    );

    const expiringPoints = calculateExpiredPoints(amount, percent);

    for (const [id, member] of members) {
      // @todo: unused var (member)
      let data = await User.findOne({ userId: id });
      if (!data) data = new User({ userId: id });
      data.marks += amount;
      if (expiringPoints > 0) {
        data.expirations = [
          ...data.expirations,
          {
            amount: expiringPoints,
            expires: Date.now() + expiresMs, // @todo: expiresMs must be casted into a number
          },
        ];
      }

      data.expirations = [
        // @todo: should be in an else block
        ...data.expirations,
        {
          amount: parseInt(amount - expiringPoints),
          expires: -1,
        },
      ];

      await data.save();
    }

    await this.client.channels.cache.get(config.logsChannel)?.send({
      embeds: [
        new DefaultEmbed()
          .setTitle("Rain")
          .setFields(
            {
              name: "Admin",
              value: `${interaction.user}`,
            },
            {
              name: "Amount",
              value: `${amount.toLocaleString()}`,
            },
            {
              name: "Expires",
              value: `${percent}% (🔥 ${expiringPoints}) ${
                expiresMs === -1
                  ? "Never"
                  : `<t:${Math.floor((Date.now() + expiresMs) / 1000)}:R>`
              }`,
            },
            {
              name: "Role",
              value: `${role} (${members.size.toLocaleString()} members)`,
            }
          )
          .setTimestamp(),
      ],
    });

    await interaction.editReply({
      embeds: [
        new SuccessEmbed(
          `**Rain finished!** \n⭐ Reward per person: **${amount.toLocaleString()}** \n🎉 Total members received: **${members.size.toLocaleString()}**`
        ),
      ],
    });

    function calculateExpiredPoints(points, percentExpire) {
      if (percentExpire === 0) {
        return 0;
      }

      return parseInt((points * percentExpire) / 100);
    }
  }
};
