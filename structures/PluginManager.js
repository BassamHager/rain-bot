const fs = require("fs");
const Cron = require("node-cron");

let credits;

try {
  credits = fs.readFileSync("./credits.txt", "utf-8");
  if (credits.length !== 417) {
    console.log("[ERROR] CREDITS REMOVED, SHUTTING DOWN PROCESS!");
    process.exit(403);
  }
} catch (err) {
  console.log("[ERROR] CREDITS REMOVED, SHUTTING DOWN PROCESS!");
  process.exit(403);
}

class PluginManager {
  constructor(client) {
    this.client = client;
  }

  async load() {
    const plugins = await fs.readdirSync("./plugins/");
    if (!plugins.length)
      throw Error("Sorry, no plugins found in plugins/ directory.");

    for (const plugin of plugins) {
      const commandsPath = `./plugins/${plugin}/commands`;
      const eventsPath = `./plugins/${plugin}/events`;
      const cronsPath = `./plugins/${plugin}/crons`;

      await this.assignPlugin(plugin);
      await this.loadCommands(commandsPath);
      await this.loadEvents(eventsPath);
      await this.loadCrons(cronsPath);

      console.log(`\n\n\n\n\n\n\n\n\n\n${credits}\n\n\n`);
    }
  }

  async assignPlugin(pluginName) {
    const Plugin = require(`../plugins/${pluginName}/${pluginName}`);
    const plugin = new Plugin(this.client);
    this.client.plugins[pluginName.toLowerCase()] = plugin;
    console.log(`[Plugins] ${pluginName} has been loaded!\n`);
  }

  async loadCommands(path) {
    let files;
    try {
      files = await fs.readdirSync(path);
    } catch (error) {
      return;
    }
    const filteredFiles = files.filter((file) => file.endsWith(".js"));
    for (const file of filteredFiles) {
      const command = new (require(`../${path}/${file}`))(this.client);
      if (!command.enabled) continue;
      this.client.commands.set(command.name, command);
    }
  }

  async loadEvents(path) {
    let files;
    try {
      files = await fs.readdirSync(path);
    } catch (error) {
      return;
    }
    const filteredFiles = files.filter((file) => file.endsWith(".js"));
    for (const file of filteredFiles) {
      const event = new (require(`../${path}/${file}`))(this.client);
      if (!event.enabled) continue;
      this.client.on(event.name, (...args) => event.run(...args));
    }
  }
  async loadCrons(path) {
    let files;
    try {
      files = await fs.readdirSync(path);
    } catch (error) {
      return;
    }
    const filteredFiles = files.filter((file) => file.endsWith(".js"));
    for (const file of filteredFiles) {
      const cron = new (require(`../${path}/${file}`))(this.client);
      if (!cron.enabled) return;
      const job = await Cron.schedule(
        cron.format,
        () => cron.execute(),
        null,
        true
      );
      job.start();
    }
  }
}

module.exports = PluginManager;
