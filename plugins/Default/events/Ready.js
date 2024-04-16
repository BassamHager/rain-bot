const config = require('../../../config');
const { Event } = require('../../../structures');

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      name: 'ready',
      enabled: true,
    });
  }
  async run() {
    this.client.application.commands.set(
      Array.from(this.client.commands.values()).map((r) => r.data.toJSON())
    );

    this.client.user.setPresence(config.presence);

    console.log(`[BOT] ${this.client.user.username} is now ready.`);
  }
};
