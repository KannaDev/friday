const Discord = require("discord.js");
const fetch = require('node-fetch');
var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017";
var collection;
//help
module.exports.run = async (bot, message, args) => {
    MongoClient.connect(url, async (err, client) => {
        collection   = client.db("friday").collection('users');
        if (err) {
            console.error(err)
            return
          }
 
      
    
       
    
        var messageArray = message.content.split(" ");
    
        
        if(messageArray.length==3){
        
            link(collection,messageArray,message);
          
      
        }else if(messageArray.length==2 && messageArray[1]=="stats"){
         await lifeStats(collection,messageArray,message);
    
        }else if(messageArray.length==4 && messageArray[1]=="stats"){
            statsRequest(messageArray,message);
    
        }else{
          let embed = new Discord.RichEmbed()
          .setTitle("**League of Legends**")
          .addField("To link your stats ","`!lol [username] [region eg: NA, EUE, KR, etc]`")
          .addField("To get your profile stats","`!lol stats`")
          .addField("To get another person's stats","`!lol stats [username] [region eg: NA, EUE, KR, etc]`")
          .setColor("#9400D3")
          .setThumbnail("http://www.macupdate.com/images/icons256/47210.png")
          message.channel.send(embed);
    
        }
         
           
    });
      
           
        //...
 

};

function link(collection,messageArray,message){
    collection.findOne({user_id: message.author.id}, (err, item) => {
  
      if(item===null){
       collection.insertOne({user_id: message.author.id,fortnite_username: messageArray[1],fortnite_plat: messageArray[2]}, (err, result) => {
           message.channel.send(`Sucessfully linked ${message.author.username}'s ${messageArray[2]} LoL username to ${messageArray[1]}`);
       })
      }else{
        
          collection.updateOne({user_id:  message.author.id}, {'$set': {'lol_username': messageArray[1],'lol_plat': messageArray[2]}}, (err, item) => {
          message.channel.send(`Sucessfully updated ${message.author.username}'s ${messageArray[2]} LoL username to ${messageArray[1]}`);
          })
    
        
      }
    });
  }


async function lifeStats(collection,messageArray,message){
        collection.find({user_id: message.author.id}).toArray(async (err, items) => {
  
            console.log(items);
        
            console.log(items.user_id);
            var username = items[0].lol_username;
            var region = items[0].lol_plat.toUpperCase();
        
            console.log(username + " " + region);
            var champIds = await getChamps();
            console.log(username);
            var prefix = getPrefix(region);
            var generalInfo =  await getGeneralInformation(prefix, username);
            var summonerId = generalInfo['summonerId'];
            var accountId = generalInfo['accountId'];
            console.log(accountId);
            var name = generalInfo['name'];
            var level = generalInfo['level'];
            var icon = generalInfo['icon'];
            console.log(generalInfo);
            var winRates = await getWinRate(prefix, accountId);
            var masteryData = await getMasteryData(prefix, summonerId);
        
            var rankData = await getRankData(prefix, summonerId);
            var soloData = rankData['solo'];
            var flexData = rankData['flex'];
            var gameStatus =await  isInGame(prefix, summonerId, username);
            var lastMatch = await getLastMatch(prefix, accountId);
            var matchData =  await getMatchStats(lastMatch['gameId'], accountId, prefix);
            var obj = JSON.parse(fs.readFileSync('./commands/gamemodes.json', 'utf8'));
            var text;
            var champ;
            try{
                champ =  `[${masteryData[0]['championLevel']}] 1. ${champIds[masteryData[0]['championId']]} : ${masteryData[0]['championPoints']}\n[${masteryData[1]['championLevel']}] 2. ${champIds[masteryData[1]['championId']]} : ${masteryData[1]['championPoints']}\n[${masteryData[2]['championLevel']}] 3. ${champIds[masteryData[2]['championId']]} : ${masteryData[2]['championPoints']}`;
              text  = `${obj[matchData['type']]['Custom']}- ${champIds[matchData.champion]} (${matchData.kills}/${matchData.deaths}/${matchData.assists}, ${matchData.cs} CS)`;
            }catch(e){
                text = "N/A"
                champ = "N/A"
            }
           
            let embed = new Discord.RichEmbed()
            embed
                .setThumbnail('http://ddragon.leagueoflegends.com/cdn/9.13.1/img/profileicon/' + icon + '.png')
                .setColor('#FFDF00')
                .setTitle(`LOL PROFILE: ${name.toUpperCase()}`)
                .addField(`Level/Region`, `${level}/${region}`, true)
                .addField('Recent Games', `${winRates.games} G ${winRates.wins}W/${winRates.losses}L WR: ${winRates.percent} %`, true)
                .addField('Top Mastery: ', champ, true)
                .addField('Ranked Solo', soloData.rank + "\n" + soloData.stats + "\n" + soloData.percent, true)
                .addField('Ranked Flex', flexData.rank + "\n" + flexData.stats + "\n" + flexData.percent, true)
                .addField('Last Game', limitText(text, 20), true)
                .setFooter(gameStatus);
            message.channel.send(embed);
        
        
        
        });
   




}

async function statsRequest(messageArray, message){
    var champIds = await getChamps();
    var region;
    region = messageArray[3].toUpperCase();
    var username = messageArray[2];
    console.log(username);
    var prefix = getPrefix(region);
    var generalInfo = await getGeneralInformation(prefix, username);
    var summonerId = generalInfo['summonerId'];
    var accountId = generalInfo['accountId'];
    console.log(accountId);
    var name = generalInfo['name'];
    var level = generalInfo['level'];
    var icon = generalInfo['icon'];
    console.log(generalInfo);
    var winRates = await getWinRate(prefix, accountId);
    var masteryData = await getMasteryData(prefix, summonerId);

    var rankData = await getRankData(prefix, summonerId);
    var soloData = rankData['solo'];
    var flexData = rankData['flex'];
    var gameStatus = await isInGame(prefix, summonerId, username);
    var lastMatch = await getLastMatch(prefix, accountId);
    var matchData = await getMatchStats(lastMatch['gameId'], accountId, prefix);
    var obj = JSON.parse(fs.readFileSync('./commands/gamemodes.json', 'utf8'));
    var text;
    var champ;
    try{
        champ =  `[${masteryData[0]['championLevel']}] 1. ${champIds[masteryData[0]['championId']]} : ${masteryData[0]['championPoints']}\n[${masteryData[1]['championLevel']}] 2. ${champIds[masteryData[1]['championId']]} : ${masteryData[1]['championPoints']}\n[${masteryData[2]['championLevel']}] 3. ${champIds[masteryData[2]['championId']]} : ${masteryData[2]['championPoints']}`;
      text  = `${obj[matchData['type']]['Custom']}- ${champIds[matchData.champion]} (${matchData.kills}/${matchData.deaths}/${matchData.assists}, ${matchData.cs} CS)`;
    }catch(e){
        text = "N/A"
        champ = "N/A"
    }
   
    let embed = new Discord.RichEmbed()
    embed
        .setThumbnail('http://ddragon.leagueoflegends.com/cdn/9.13.1/img/profileicon/' + icon + '.png')
        .setColor('#FFDF00')
        .setTitle(`LOL PROFILE: ${name.toUpperCase()}`)
        .addField(`Level/Region`, `${level}/${region}`, true)
        .addField('Recent Games', `${winRates.games} G ${winRates.wins}W/${winRates.losses}L WR: ${winRates.percent} %`, true)
        .addField('Top Mastery: ', champ, true)
        .addField('Ranked Solo', soloData.rank + "\n" + soloData.stats + "\n" + soloData.percent, true)
        .addField('Ranked Flex', flexData.rank + "\n" + flexData.stats + "\n" + flexData.percent, true)
        .addField('Last Game', limitText(text, 20), true)
        .setFooter(gameStatus);
    message.channel.send(embed);
}

function getUsername(args) {
    var name = "";
    for (var i = 1; i < args.length; i++){
        name+=args[i];
    }
    return name;
}

function limitText(text, maxlen) {
    var parts = text.split(' ');
    var newText = '';
    var curLen = 0;
    for (var i = 0; i < parts.length; i++) {
        curLen += parts[i].length + 1;
        if (curLen > maxlen) {
            newText += '\n';
            curLen -= maxlen;
        }
        newText += parts[i] + ' ';
    }
    return newText;
}

async function isInGame(prefix, summonerId, username) {
    return new Promise(function (resolve, reject) {
        var requestUrl = 'https://' + prefix + '.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/' + summonerId;
        fetch(requestUrl, {
            method: 'GET',
            headers: { 'X-Riot-Token': process.env.league_key }
        }).then(function (response) {
            return response.json();
        }).then(async function (json) {
            var obj = JSON.parse(fs.readFileSync('./commands/gamemodes.json', 'utf8'));
            if (json['gameId']) {
                resolve(`${username} has been playing ${obj[json['gameQueueConfigId']]["Custom"]} for ${Math.floor(json['gameLength'] / 60)} minutes and ${json['gameLength'] % 60} seconds`)
            } else {
                resolve(`${username} is not currently in game`)
            }
        })
    })
}

async function getRankData(prefix, summonerId) {
    return new Promise(function (resolve, reject) {
        var requestUrl = 'https://' + prefix + '.api.riotgames.com/lol/league/v4/positions/by-summoner/' + summonerId;
        fetch(requestUrl, {
            method: 'GET',
            headers: { 'X-Riot-Token': process.env.league_key }
        }).then(function (response) {
            return response.json();
        }).then(function (json) {
            var solo = {};
            var flex = {};
            try {
                var soloRank = json[0]['tier'] + " " + json[0]['rank'] + " " + json[0]['leaguePoints'] + "LP";
                var soloWins = parseInt(json[0]['wins']);
                var soloLosses = parseInt(json[0]['losses']);
                var soloStats = (soloWins + soloLosses + "G") + " " + json[0]['wins'] + "W/" + json[0]['losses'] + "L";
                solo = {
                    rank: json[0]['tier'] + " " + json[0]['rank'] + " " + json[0]['leaguePoints'] + "LP",
                    stats: (soloWins + soloLosses + "G") + " " + json[0]['wins'] + "W/" + json[0]['losses'] + "L",
                    percent: Math.round((soloWins) / (soloWins + soloLosses) * 100) + "%"
                };
            } catch (e) {
                solo = {
                    rank: "N/A",
                    stats: "",
                    percent: ""
                };
            } try {
                var flexRank = json[1]['tier'] + " " + json[1]['rank'] + " " + json[1]['leaguePoints'] + "LP";
                var flexWins = parseInt(json[1]['wins']);
                var flexLosses = parseInt(json[1]['losses']);
                var flexStats = (flexWins + flexLosses + "G") + " " + json[1]['wins'] + "W/" + json[1]['losses'] + "L";
                flex = {
                    rank: json[1]['tier'] + " " + json[1]['rank'] + " " + json[1]['leaguePoints'] + "LP",
                    stats: (flexWins + flexLosses + "G") + " " + json[1]['wins'] + "W/" + json[1]['losses'] + "L",
                    percent: Math.round((flexWins) / (flexWins + flexLosses) * 100) + "%"
                };
            } catch (e) {
                flex = {
                    rank: "N/A",
                    stats: "",
                    percent: ""
                };
            }
            var data = {
                solo: solo,
                flex: flex
            }
            resolve(data);
        })
    })
}


async function getMasteryData(prefix, summonerId) {
    return new Promise(function (resolve, reject) {
        var requestUrl = 'https://' + prefix + '.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/' + summonerId;
        fetch(requestUrl, {
            method: 'GET',
            headers: { 'X-Riot-Token': process.env.league_key }
        }).then(function (response) {
            return response.json();
        }).then(function (json) {
            resolve(json);
        })
    })
}

async function getGeneralInformation(prefix, username) {
    return new Promise(function (resolve, reject) {
        var requestUrl = 'https://' + prefix + '.api.riotgames.com/lol/summoner/v4/summoners/by-name/' + encodeURIComponent(username);
        fetch(requestUrl, {
            method: 'GET',
            headers: { 'X-Riot-Token': process.env.league_key }
        }).then(function (response) {
            return response.json();
        }).then(async function (json) {
            var summonerId = json['id'];
            var accountId = json['accountId'];
            var name = json['name'];
            var level = json['summonerLevel'];
            var icon = json['profileIconId'];
            var data = {
                summonerId: summonerId,
                accountId: accountId,
                name: name,
                level: level,
                icon: icon
            }
            resolve(data);
        })
    })
}

async function getChamps() {
    return new Promise(function (resolve, reject) {
        fetch('http://ddragon.leagueoflegends.com/cdn/6.24.1/data/en_US/champion.json', {
            method: 'GET'
        }).then(function (response) {
            return response.json();
        }).then(function (json) {
            var obj = json['data'];
            var champIds = [];
            Object.keys(obj).forEach(function (key) {
                champIds[obj[key]['key']] = key;
            })
            resolve(champIds);
        })
    })
}

async function getWinRate(prefix, accountId) {
    return new Promise(function (resolve, reject) {
        var requestUrl = 'https://' + prefix + '.api.riotgames.com/lol/match/v4/matchlists/by-account/' + accountId;
        var myValue = "hi";
        fetch(requestUrl, {
            method: 'GET',
            headers: { 'X-Riot-Token': process.env.league_key }
        }).then(function (response) {
            return response.json();
        }).then(async function (json) {
            try{
                var len = Math.min(json['matches'].length, 2);
                var wins = 0;
                for (var i = 0; i < len; i++) {
                    var gameId = json['matches'][i]['gameId'];
                    var result = await getGameResult(gameId, accountId, prefix);
                    if (result == true) {
                        wins++;
                    }
                }
                var data = {
                    wins: wins,
                    games: len,
                    losses: len - wins,
                    percent: Math.round((wins / len * 100))
                }
                resolve(data);
            }catch(e){
                var data = {
                    wins: 0,
                    games: 0,
                    losses: 0,
                    percent: 0
                }
                resolve(data);
            }

         
          
        })
    })
}

async function getGameResult(gameId, accountId, prefix) {
    return new Promise(function (resolve, reject) {
        var requestUrl = 'https://' + prefix + '.api.riotgames.com/lol/match/v4/matches/' + gameId;
        fetch(requestUrl, {
            method: 'GET',
            headers: { 'X-Riot-Token': process.env.league_key }
        }).then(function (response) {
            return response.json();
        }).then(function (json) {
            var participants = json['participantIdentities'];
            var participantId = -1;
            for (var i = 0; i < participants.length; i++) {
                if (participants[i]['player']['currentAccountId'] == accountId) {
                    participantId = i;
                    break;
                }
            }
            var win = json['participants'][participantId]['stats']['win'];
            resolve(win);

        })
    })
}

async function getLastMatch(prefix, accountId) {
    return new Promise(function (resolve, reject) {
        var requestUrl = 'https://' + prefix + '.api.riotgames.com/lol/match/v4/matchlists/by-account/' + accountId;
        var myValue = "hi";
        fetch(requestUrl, {
            method: 'GET',
            headers: { 'X-Riot-Token': process.env.league_key }
        }).then(function (response) {
            return response.json();
        }).then(function (json) {
            try{
                resolve(json['matches'][0]);
            }catch(e){
                resolve('N/A');
            }
        
        })
    })

}

async function getMatchStats(matchId, accountId, prefix) {
    return new Promise(function (resolve, reject) {
        var requestUrl = 'https://' + prefix + '.api.riotgames.com/lol/match/v4/matches/' + matchId;
        fetch(requestUrl, {
            method: 'GET',
            headers: { 'X-Riot-Token': process.env.league_key }
        }).then(function (response) {
            return response.json();
        }).then(function (json) {
            var participants = json['participantIdentities'];
            var participantId = -1;
            try{
                for (var i = 0; i < participants.length; i++) {
                    if (participants[i]['player']['currentAccountId'] == accountId) {
                        participantId = i;
                        break;
                    }
                }
                var kills = json['participants'][participantId]['stats']['kills'];
                var deaths = json['participants'][participantId]['stats']['deaths'];
                var assists = json['participants'][participantId]['stats']['assists'];
                var champion = json['participants'][participantId]['championId'];
                var cs = json['participants'][participantId]['stats']['totalMinionsKilled'];
                var type = json['queueId'];
                var data = {
                    kills: kills,
                    deaths: deaths,
                    assists: assists,
                    champion: champion,
                    cs: cs,
                    type: type
                };
                resolve(data);
            }catch(e){
                var data = {
                    kills: 0,
                    deaths: 0,
                    assists: 0,
                    champion: "N/A",
                    cs: 0,
                    type: 0
                };
                resolve(data);
            }
        
        

        })
    })
}


function getPrefix(region) {
    switch (region) {
        case 'BR':
            return 'BR1';
        case 'EUNE':
            return 'EUN1';
        case 'EUW':
            return 'EUW1';
        case 'JP':
            return 'JP1';
        case 'KR':
            return 'KR';
        case 'LAN':
            return 'LA1';
        case 'LAS':
            return 'LA2';
        case 'NA':
            return 'NA1';
        case 'OCE':
            return 'OC1';
        case 'TR':
            return 'TR1';
        case 'RU':
            return 'RU';
        case 'PBE':
            return 'PBE1';
    }
}



module.exports.help = {
    name: "lol"
};