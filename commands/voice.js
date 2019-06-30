const Discord = require("discord.js");
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffmpeg = require('fluent-ffmpeg');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
const fs = require('fs')

const { Readable } = require('stream');

const SILENCE_FRAME = Buffer.from([0xF8, 0xFF, 0xFE]);

class Silence extends Readable {
  _read() {
    this.push(SILENCE_FRAME);
  }
}

module.exports.run = async (bot, message, args) => {
  const connection = await message.member.voiceChannel.join()
  connection.playOpusStream(new Silence());
  const receiver = connection.createReceiver()

  connection.on("speaking", (user, speaking) => {
    if (!speaking) {
      return
    }

      console.log(`I'm listening to ${user.username}`);
      const audioStream = receiver.createPCMStream(user);

      const requestConfig = {
        encoding: 'LINEAR16',
        sampleRateHertz: 16000,
        languageCode: 'en-US'
      }

      const request = {
        config: requestConfig
      }


      var outStream = fs.createWriteStream('output.wav');
      
      ffmpeg(audioStream)
      .inputFormat('s32le')
      .audioFrequency(16000)
      .audioChannels(1)
      .audioCodec('pcm_s16le')
      .format('wav')
      .pipe(outStream);
      audioStream.on('data', (chunk) => {
        console.log(`Received ${chunk.length} bytes of data.`);
      });
      audioStream.on('end', async () => {
        outStream.end();
        console.log('audioStream end')
      })

    
  });
};

module.exports.help = {
  name: "join"
};