const Discord = require("discord.js");
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffmpeg = require('fluent-ffmpeg');
var WitSpeech = require('node-witai-speech');
var ask  =require("./ask");


ffmpeg.setFfmpegPath(ffmpegInstaller.path);
const fs = require('fs')

const { Readable } = require('stream');

const SILENCE_FRAME = Buffer.from([0xF8, 0xFF, 0xFE]);

class Silence extends Readable {
  _read() {
    this.push(SILENCE_FRAME);
  }
}

var API_KEY = process.env.WIT_API;
var content_type = "audio/wav";


module.exports.run = async (bot, message, args) => {
  const connection = await message.member.voiceChannel.join()
  const dispatcher = connection.playOpusStream(new Silence());
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
        //console.log(`Received ${chunk.length} bytes of data.`);
      });
      audioStream.on('end', async () => {
        outStream.end();
        var stream = fs.createReadStream("output.wav");
        var parseSpeech =  new Promise((ressolve, reject) => {
          // call the wit.ai api with the created stream
          WitSpeech.extractSpeechIntent(API_KEY, stream, content_type, 
          (err, res) => {
              if (err) return reject(err);
              ressolve(res);
          });
      });
       
      // check in the promise for the completion of call to witai
   

      parseSpeech.then((data) => {
        var datta =  data._text.toString();
        if(datta.includes("what")||datta.includes("who")||datta.includes("when")||datta.includes("where")){
      ask.voice(message,datta,connection,dispatcher);
        }
          console.log(data);
      })
      .catch((err) => {
          console.log(err);
      })
        console.log('audioStream end')
      })

    
  });
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports.help = {
  name: "join"
};