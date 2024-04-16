const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { DefaultEmbed, ErrorEmbed, SuccessEmbed } = require("../../../embeds");
const { logsChannel } = require("../../../config");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "send",
      enabled: true,
      data: new SlashCommandBuilder()
        .setName("send")
        .setDescription("Send")
        .addUserOption((user) =>
          user.setName("user").setDescription("User").setRequired(true)
        )
        .addNumberOption((amount) =>
          amount
            .setName("amount")
            .setDescription("Amount")
            .setMinValue(1)
            .setRequired(true)
        )
        .addStringOption((str) =>
          str.setName("reason").setDescription("Reason").setRequired(true)
        ),
    });
  }
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: false });

    const sender = interaction.user;
    const receiver = interaction.options.getUser("user");
    const amount = interaction.options.getNumber("amount");
    const reason = interaction.options.getString("reason", false);

    if (sender.id === receiver.id)
      return await interaction.editReply({
        embeds: [new ErrorEmbed("You cannot send to yourself!")],
      });

    const { marks, expirations } = await this.client.plugins.default.getData(
      sender.id
    );

    const filteredExpirations = expirations
      .filter((expiration) => expiration.expires !== -1)
      .sort((a, b) => a.expires - b.expires);

    const totalExpiringMarks = filteredExpirations.reduce(
      (acc, curr) => acc + curr.amount,
      0
    );

    if (amount > totalExpiringMarks / 10)
      return await interaction.editReply({
        embeds: [
          new ErrorEmbed("You cannot send more than 10% expiring marks!"),
        ],
      });

    let remainingAmount = amount;

    for (const expiration of filteredExpirations) {
      if (remainingAmount <= 0) break;

      let unique = expiration;

      if (expiration.amount >= remainingAmount) {
        expiration.amount -= remainingAmount;

        if (expiration.amount === 0) {
          await this.client.plugins.default.removeExpiration(
            sender.id,
            expiration
          );
        }

        await this.client.plugins.default.updateExpiration(
          sender.id,
          unique,
          expiration.amount
        );

        remainingAmount = 0;
      } else {
        remainingAmount -= expiration.amount;
        expiration.amount = 0;
        await this.client.plugins.default.removeExpiration(sender.id, unique);
      }
    }

    await this.client.plugins.default.transfer(sender.id, receiver.id, amount);

    const { roles } = await this.client.plugins.default.getSettings(
      interaction.guild.id
    );

    const { marks: receiverBalance } =
      await this.client.plugins.default.getData(receiver.id);

    for (const role of roles) {
      if (marks - amount < role.requiredMarks) {
        try {
          await interaction.guild.members.cache
            .get(sender.id)
            .roles.remove(role.roleId);
        } catch (err) {}
      }
      if (receiverBalance >= role.requiredMarks)
        try {
          await interaction.guild.members.cache
            .get(receiver.id)
            .roles.add(role.roleId);
        } catch (err) {}
    }

    await this.client.channels.cache.get(logsChannel)?.send({
      embeds: [
        new DefaultEmbed()
          .setTitle("Balance Transfer")
          .setFields(
            {
              name: "Sender",
              value: `${sender}`,
            },
            {
              name: "Recipient",
              value: `${receiver}`,
            },
            {
              name: "Amount",
              value: `${amount.toLocaleString()}`,
            },
            {
              name: "Reason",
              value: reason,
            }
          )
          .setTimestamp(),
      ],
    });

    await interaction.editReply({
      embeds: [
        new SuccessEmbed(
          `Successfully sent 🔥 **${amount.toLocaleString()}** Firebrand Marks to ${receiver}`
        ),
      ],
    });
  }
};
