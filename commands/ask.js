const Discord = require("discord.js");
const axios = require("axios");
const say = require('say')


module.exports.run = async (bot, message, args) => {
  let query = args.join(" ");
  query = validateQuery(query);

  try {
    let json = await axios.get(
      `http://api.wolframalpha.com/v1/result?appid=${
        process.env.WOLF_API
      }&i=${query}%3f`
    );
    message.channel.send(json.data);
  } catch (err) {
    // console.log(err);
    message.channel.send("I am sorry, I do not understand how to answer that");
  }

  function validateQuery(query) {
    for (let i = 0; i < query.length; i++) {
      if (query.charAt(i) == " ") {
        query = query.replace(" ", "+");
      }
    }
    return query;
  }
};


module.exports.voice = async (message, info,connection,dispatcher) => {
  console.log("i am here");
  let query = info;
  query = validateQuery(query);

  console.log(query);

  try {
    let json = await axios.get(
      `http://api.wolframalpha.com/v1/result?appid=${
        process.env.WOLF_API
      }&i=${query}%3f`
    );

    say.export(json.data, null,1.3,'hal.wav', (err) => {
      try{
        dispatcher.destroy();
      }catch(e){

      }

      connection.playFile('hal.wav');
      if (err) {
        return console.error(err)
      }

    });
  

    message.channel.send(json.data);
  } catch (err) {
    // console.log(err);
    message.channel.send("I am sorry, I do not understand how to answer that");
  }

  function validateQuery(query) {
    for (let i = 0; i < query.length; i++) {
      if (query.charAt(i) == " ") {
        query = query.replace(" ", "+");
      }
    }
    return query;
  }
};

module.exports.help = {
  name: "ask"
};
