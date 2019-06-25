const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
  const connection = await message.member.voiceChannel.join();

  connection.on("speaking", (user, speaking) => {
    if (speaking) {
      console.log(`I'm listening to ${user.username}`);
    } else {
      console.log(`I stopped listening to ${user.username}`);
    }
  });
};

module.exports.help = {
  name: "join"
};
