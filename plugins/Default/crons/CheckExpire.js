const { logsChannel } = require("../../../config");
const { DefaultEmbed } = require("../../../embeds");
const { User } = require("../../../models/User");
const { Cron } = require("../../../structures");

module.exports = class extends Cron {
  constructor(client) {
    super(client, {
      enabled: true,
      format: "* * * * *",
    });
  }
  async execute() {
    const guild = this.client.guilds.cache.first();
    const users = await User.find();

    const { roles } = await this.client.plugins.default.getSettings(guild.id);

    for (const user of users) {
      const expirations = user.expirations;

      for (const role of roles) {
        const currentBalance = user.marks;

        if (currentBalance < role.requiredMarks) {
          try {
            const member = guild.members.cache.get(user.userId);
            await member.roles.remove(role.roleId);
          } catch (err) {}
        } else {
          try {
            const member = guild.members.cache.get(user.userId);
            await member.roles.add(role.roleId);
          } catch (err) {}
        }
      }

      const expired = expirations.filter(
        (e) => Date.now() > e.expires && e.expires !== -1
      );

      for (const expire of expired) {
        if (expire.expires > Date.now()) continue;

        const balance = await this.client.plugins.default.getData(user.userId);

        for (const role of roles) {
          const currentBalance = balance - expire.amount;

          if (currentBalance < role.requiredMarks) {
            try {
              const member = guild.members.cache.get(user.userId);
              await member.roles.remove(role.roleId);
            } catch (err) {}
          } else {
            try {
              const member = guild.members.cache.get(user.userId);
              await member.roles.add(role.roleId);
            } catch (err) {}
          }
        }

        await this.client.plugins.default.removeMarks(
          user.userId,
          expire.amount
        );
        await this.client.plugins.default.removeExpiration(user.userId, expire);

        await this.client.channels.cache.get(logsChannel)?.send({
          embeds: [
            new DefaultEmbed()
              .setTitle("Balance Update")
              .setFields(
                {
                  name: "Admin",
                  value: `${this.client.user}`,
                },
                {
                  name: "User",
                  value: `<@${user.userId}>`,
                },
                {
                  name: "Amount",
                  value: `-${expire.amount.toLocaleString()}`,
                },
                {
                  name: "Reason",
                  value: `Expired`,
                }
              )
              .setTimestamp(),
          ],
        });
      }
    }
  }
};
