const Discord = require("discord.js");
const fs = require("fs");
require("dotenv").config();

const bot = new Discord.Client({ disableEveryon: true });
bot.commands = new Discord.Collection();

fs.readdir("./commands/", (err, files) => {
  if (err) console.log(err);

  let file = files.filter(f => f.split(".").pop() == "js");

  if (file.length <= 0) {
    console.log("Unable to load commands");
    return;
  }

  file.forEach((f, i) => {
    let props = require(`./commads/${f}`);
    bot.commands.set(props.help.name, props);
    console.log(`${f} loaded!`);
  });
});

bot.on("ready", async () => {
  console.log(
    `${bot.user.username} is online! Currently in ${bot.guilds.size} servers!`
  );
  bot.user.setActivity(`${process.env.PREFIX} | R.I.P. Tony Stark`, {
    type: "Watching"
  });
});

bot.on("message", async message => {
  if (message.author.bot) return;

  let prefix = process.env.PREFIX;
  let msgarray = message.content.split(" ");
  let cmd = msgarray[0];
  let args = msgarray.slice(1);

  if (cmd.charAt(0) == prefix) {
    let commandFile = bot.commands.get(cmd.slice(prefix.length));
    if (commandFile) commandFile.run(bot, message, args);
  }
});

bot.login(process.env.DISCORD_TOKEN);
