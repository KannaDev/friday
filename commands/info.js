const Discord = require("discord.js");
const package = require("../package.json");

module.exports.run = async (bot, message, args) => {
  let botinfo = new Discord.RichEmbed()
    .setTitle("## BOT INFORMATION ##")
    .setColor("#f4a442")
    .setThumbnail(bot.user.displayAvatarURL)
    .addField(
      "Name",
      `[${bot.user.username}](https://www.github.com/KannaDev/friday)`
    )
    .addField("Version", `${package.version}`)
    .addField("Running on", `${bot.guilds.size} servers`)
    .addField(
      "Developed by",
      `[Anirudh Emmadi](https://anirudhemmadi.com)\n[Darshan Bhatta](https://darshanbhatta.com)\n[Rohith Karkala](https://github.com/RKarkala)`
    )
    .addField("Created on", bot.user.createdAt);
  message.channel.send(botinfo); //Sends bot info

  let svinfo = new Discord.RichEmbed()
    .setTitle("## SERVER INFORMATION ##")
    .setColor("#418ff4")
    .setThumbnail(message.guild.iconURL)
    .addField("Server Name", message.guild.name)
    .addField("Server ID", message.guild.id)
    .addField("Created on", message.guild.createdAt)
    .addField("Server Region", message.guild.region)
    .addField("Server Owner", message.guild.owner)
    .addField("Total Members", message.guild.memberCount);
  return message.channel.send(svinfo); //Sends server info
};

module.exports.help = {
  name: "info"
};
