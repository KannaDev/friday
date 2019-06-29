const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
  const connection = await message.member.voiceChannel.leave();
};

module.exports.help = {
  name: "leave"
};
