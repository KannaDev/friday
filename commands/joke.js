const Discord = require("discord.js");
const package = require("../package.json");
const axios = require("axios");

module.exports.run = async (bot, message, args) => {
  let json = await axios.get(
    "https://official-joke-api.appspot.com/random_joke"
  );
  console.log(json);
  let svinfo = new Discord.RichEmbed()
    .setTitle(`${json.data.setup}`)
    .setColor("#418ff4")
    .addField("Answer", json.data.punchline);
  return message.channel.send(svinfo); //Sends server info
};

module.exports.help = {
  name: "joke"
};
