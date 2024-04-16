const { Settings } = require("../../models/Settings");
const { User } = require("../../models/User");

class DefaultPlugin {
  constructor(client) {
    this.client = client;
    this.version = "1.0";
    this.author = "fiverr.com/drangula";
  }

  async ensure(userId) {
    if ((await User.exists({ userId })) || (await User.findOne({ userId })))
      return;
    const user = new User({ userId });
    await user.save();
  }

  async getData(userId) {
    await this.ensure(userId);
    const data = await User.findOne({ userId });
    return data;
  }

  async addMarks(userId, amount, expires) {
    const data = await this.getData(userId);
    data.marks += amount;
    data.expirations = [
      ...data.expirations,
      {
        amount,
        expires,
      },
    ];
    await data.save();
  }
  async removeMarks(userId, amount) {
    const data = await this.getData(userId);

    const oldExpiration = data.expirations.find(
      (e) => e.amount >= amount && e.expires === -1
    );
    const rest = data.expirations.filter((e) => e !== oldExpiration);
    if (oldExpiration) {
      oldExpiration.amount -= amount;

      if (oldExpiration.amount > 0) {
        data.expirations = [...rest, oldExpiration];
      }
    }

    data.marks -= amount;

    await data.save();
  }
  async removeExpiration(userId, expiration) {
    const data = await this.getData(userId);
    data.expirations = [
      ...data.expirations.filter(
        (e) =>
          e.amount !== expiration.amount && e.expires !== expiration.expires
      ),
    ];
    await data.save();
  }

  async updateExpiration(userId, expiration, newAmount) {
    const data = await this.getData(userId);
    data.expirations = [
      ...data.expirations.filter(
        (e) =>
          e.amount !== expiration.amount && e.expires !== expiration.expires
      ),
    ];
    data.expirations = [
      ...data.expirations,
      { expires: expiration.expires, amount: newAmount },
    ];
    await data.save();
  }

  async transfer(userId1, userId2, amount) {
    const data1 = await this.getData(userId1);
    const data2 = await this.getData(userId2);

    data1.marks -= amount;
    data2.marks += amount;

    data2.expirations = [...data2.expirations, { amount, expires: -1 }];

    await data1.save();
    await data2.save();
  }

  async ensureSettings(guildId) {
    if (
      (await Settings.exists({ guildId })) ||
      (await Settings.findOne({ guildId }))
    )
      return;
    const settings = new Settings({ guildId });
    await settings.save();
  }

  async getSettings(guildId) {
    await this.ensureSettings(guildId);
    const data = await Settings.findOne({ guildId });
    return data;
  }
  async addRole(guildId, roleId, requiredMarks) {
    const data = await this.getSettings(guildId);
    data.roles = [
      ...data.roles,
      {
        roleId,
        requiredMarks,
      },
    ];
    await data.save();
  }
  async removeRole(guildId, roleId) {
    const data = await this.getSettings(guildId);
    data.roles = [...data.roles.filter((r) => r.roleId !== roleId)];
    await data.save();
  }
}

module.exports = DefaultPlugin;
