const Discord = require("discord.js");
const package = require("../package.json");
const Fortnite = require('fortnite');

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017";
const ftnApi = new Fortnite(process.env.fortnite_token);



module.exports.run = async (bot, message, args) => {

  message.channel.send(message.guild.id)

   MongoClient.connect(url, (err, client) => {
    if (err) {
      console.error(err)
      return
    }

    const collection = client.db("friday").collection('users');

    var messageArray = message.content.split(" ");

    
    if(messageArray.length==3){
    
        link(collection,messageArray,message);
      
  
    }else if(messageArray.length==2 && messageArray[1]=="stats"){
      lifeStats(collection,messageArray,message);

    }else if(messageArray.length==4 && messageArray[1]=="stats"){
      lifeStatsOther(collection,messageArray,message);

    }else{
      let embed = new Discord.RichEmbed()
      .setTitle("**Fortnite**")
      .addField("To link your stats ","`!fortnite [username] [platform pc/xbox/psn]`")
      .addField("To get your profile stats","`!fortnite stats`")
      .addField("To get another person's stats","`!fortnite stats [username] [platform pc/xbox/psn]`")
      .setColor("#9400D3")
      .setThumbnail("https://vignette.wikia.nocookie.net/fortnite/images/6/61/Battle_Royale_logo.png/revision/latest/scale-to-width-down/480?cb=20180313000428")
      message.channel.send(embed);

    }
     
       

  
       
    //...
  })
 


}

function link(collection,messageArray,message){
  collection.findOne({user_id: message.author.id}, (err, item) => {

    if(item===null){
     collection.insertOne({user_id: message.author.id,fortnite_username: messageArray[1],fortnite_plat: messageArray[2]}, (err, result) => {
         message.channel.send(`Sucessfully linked ${message.author.username}'s ${messageArray[2]} Fortnite username to ${messageArray[1]}`);
     })
    }else{
      
        collection.updateOne({user_id:  message.author.id}, {'$set': {'fortnite_username': messageArray[1],'fortnite_plat': messageArray[2]}}, (err, item) => {
        message.channel.send(`Sucessfully updated ${message.author.username}'s ${messageArray[2]} Fortnite username to ${messageArray[1]}`);
        })
  
      
    }
  });
}

    function lifeStats(collection,messageArray,message){
      collection.find({user_id: message.author.id}).toArray((err, items) => {
    
      console.log(items);

      console.log(items.user_id);
      var username = items[0].fortnite_username;
      console.log(username);
        let data = ftnApi
        .user(username, items[0].fortnite_plat)
        .then(data => {
          let stats = data.stats; //Raw stats
    
            let lifetime = stats.lifetime; //Lifetime stats
            console.log(lifetime);
           // let lifeScore = lifetime[6]["Score"];
            let lifeMatches = lifetime.matches;
            let lifeWins = lifetime.wins;
            let lifeWinPercent = Math.round(lifeMatches/lifeWins*100);
            let lifeKills = lifetime.kills;
            let lifeKd = lifetime.kd;
    
            let lifeEmbed = new Discord.RichEmbed()
              .setTitle("FORTNITE LIFETIME STATS")
              .setThumbnail(
                "https://i.gyazo.com/bf61b9b159a69da22b900a7eb15bf96e.png"
              )
              .setDescription(`Lifetime stats for ${username}`)
              .setColor("#42b6f4")
              .addField("Wins", lifeWins, true)
              .addField("Kills", lifeKills, true)
              .addField("K/D", lifeKd, true)
              .addField("Matches Played", lifeMatches, true)
              .addField("Win Percentage", lifeWinPercent, true);
    
            message.channel.send(lifeEmbed); //Sends lifetime stats
      
    
    });


  });
  
  
  

}

function lifeStatsOther(collection,messageArray,message){
  collection.find({user_id: message.author.id}).toArray((err, items) => {

  console.log(items);

  console.log(items.user_id);
  var username = items[0].fortnite_username;
  console.log(message);
    let data = ftnApi
    .user(messageArray[2], messageArray[3])
    .then(data => {
      let stats = data.stats; //Raw stats

        let lifetime = stats.lifetime; //Lifetime stats
        console.log(lifetime);
       // let lifeScore = lifetime[6]["Score"];
        let lifeMatches = lifetime.matches;
        let lifeWins = lifetime.wins;
        let lifeWinPercent = Math.round(lifeMatches/lifeWins*100);
        let lifeKills = lifetime.kills;
        let lifeKd = lifetime.kd;

        let lifeEmbed = new Discord.RichEmbed()
          .setTitle("FORTNITE LIFETIME STATS")
          .setThumbnail(
            "https://i.gyazo.com/bf61b9b159a69da22b900a7eb15bf96e.png"
          )
          .setDescription(`Lifetime stats for ${messageArray[2]}`)
          .setColor("#42b6f4")
          .addField("Wins", lifeWins, true)
          .addField("Kills", lifeKills, true)
          .addField("K/D", lifeKd, true)
          .addField("Matches Played", lifeMatches, true)
          .addField("Win Percentage", lifeWinPercent, true);

        message.channel.send(lifeEmbed); //Sends lifetime stats
  

});


});




}

module.exports.help = {
  name: "fortnite"
};
