const Discord = require("discord.js");
const ffmpeg = require("ffmpeg-binaries");
const WitSpeech = require("node-witai-speech");
const API_KEY = process.env.WIT_API;
const content_type = "audio/wav";

module.exports.run = async (bot, message, args) => {
  const connection = await message.member.voiceChannel.join();
  const receiver = connection.createReceiver();

  connection.on("speaking", (user, speaking) => {
    if (speaking) {
      console.log(`I'm listening to ${user.username}`);
    }
    const audioStream = receiver.createPCMStream(user);
    const requestConfig = {
      encoding: "LINEAR16",
      sampleRateHertz: 48000,
      languageCode: "en-US"
    };
    const request = {
      config: requestConfig
    };

    const parseSpeech = new Promise((resolve, reject) => {
      WitSpeech.extractSpeechIntent(
        API_KEY,
        audioStream,
        content_type,
        (err, res) => {
          if (err) return reject(err);
          resolve(res);
        }
      );
    });

    parseSpeech
      .then(data => {
        console.log(data);
      })
      .catch(err => {
        console.log(err);
      });
  });
};

module.exports.help = {
  name: "join"
};
