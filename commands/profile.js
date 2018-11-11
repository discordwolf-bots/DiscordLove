const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);

const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./utils/users.db', sqlite3.OPEN_READWRITE, (err) => {
  if(err){
    console.error(err.message);
  }
  console.log(`Connected to DB - Profile`);
});

const achievement_self_worth = (message, client) => {
  let sql = `SELECT * FROM users WHERE id = ${message.author.id}`;
  db.get(sql, (err, row) => {
    if(err) return console.error(err.message);
    let value = row.cost;
    let self_worth_progress = row.achieve_your_value;
    let achieved = 0;

    for(let i=0; i<config.thresh_self_worth.length; i++){
      if(value >= parseInt(config.thresh_self_worth.split(',')[i]))
        if(self_worth_progress < i+1)
          achieved = i+1;
    }

    if(achieved > 0){
      let rewards = 0;
      for(let i=self_worth_progress;i<=achieved;i++){
        for(let j=1; j<=config.thresh_self_worth.length; j++){
          if(i == j) rewards += parseInt(config.rewards.split(',')[j-1]);
        }
      }

      let embed = new Discord.RichEmbed()
        .setColor('#4DBF42')
        .setAuthor(`Achievement Gained! - \$${rewards} added!`, message.author.avatarURL)
        .setFooter(`Gained ${achieved-self_worth_progress} Levels on the Self Worth achievement`);
      message.channel.send(embed);
      let newBalance = row.money + rewards;
      let sqlUpdate = `UPDATE users SET money = ${newBalance}, achieve_your_value = ${achieved} WHERE id = ${message.author.id}`;
      db.run(sqlUpdate, (err) => {
        if(err) return console.error(err.message);
        client.channels.get(config.logging).send(`:bust_in_silhouette: ACHIEVEMENT SELF WORTH : ${message.author.username}#${message.author.discriminator} - ${row.money} -> ${newBalance}`);
      });
    }
  });
}


Number.prototype.format = function(n, x) {
  var re = '(\\d)(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
  return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$1,');
};

exports.run = function(client, message, args){
  let target = message.author.id;
  let now = moment().format('x');
  if(message.mentions.members.first()) target = message.mentions.members.first().user.id;
  let sqlCheck = `SELECT * FROM users WHERE id = ${target}`;
  db.get(sqlCheck, [], (err,row) => {
    if(err) return console.error(err.message);
    if(!row){
      if(target != message.author.id) return message.channel.send(`This user needs to setup their own profile.`);
      return message.channel.send(`Please do the command **${config.prefix}start** in ${message.guild.channels.get('505128715202723850').toString()} first!`);
    } else {
      if(now - parseInt(row.lastprofile) < 60 * 1000){ message.delete(); return message.reply(`Please wait another **${Math.floor((( 60 * 1000 ) - (now - parseInt(row.lastprofile)))/1000)}** seconds.`); }
/**
  TODO: Multi guild check. Blocked channels?
**/
      if(message.channel.id != '505133836280266752') { message.delete(); return message.channel.send(`Please only use DiscordLove commands in ${message.guild.channels.get('505133836280266752').toString()}`); }
      let owner = row.owner;
      let ownerName = "None";
      if(owner != 0){
        let ownerUser = message.guild.members.get(owner);
        if(ownerUser){
          if(ownerUser.nickname != null){
            ownerName = `** ${ownerUser.nickname}** (${ownerUser.user.username}#${ownerUser.user.discriminator})`;
          } else {
            ownerName = `** ${ownerUser.user.username}** (${ownerUser.user.username}#${ownerUser.user.discriminator})`;
          }
        }
        if(!ownerUser) ownerName = "<" + owner + ">";
      }

      // Get all icon Levels
      let redHeart = `<:heart_red:505752941932838912>`;
      let bronzeHeart = `<:heart_bronze:505750301614276618>`;
      let silverHeart = `<:heart_silver:505750301341515779>`;
      let goldHeart = `<:heart_gold:505750302226645003>`;
      let platinumHeart = `<:heart_platinum:505750302796939283>`;
      let diamondHeart = `<:heart_diamond:505750302863917056>`;
      // Value Icon is based on rpw.achieve_your_value
      let your_value = row.achieve_your_value;
      let value_icon = redHeart;
      if(your_value >= 6) value_icon = bronzeHeart;
      if(your_value >= 7) value_icon = silverHeart;
      if(your_value >= 8) value_icon = goldHeart;
      if(your_value >= 9) value_icon = platinumHeart;
      if(your_value >= 10) value_icon = diamondHeart;

      // Bank Icon is based on row.achieve_owned_value
      let owned_value = row.achieve_owned_value;
      let bank_icon = redHeart;
      if(owned_value >= 6) bank_icon = bronzeHeart;
      if(owned_value >= 7) bank_icon = silverHeart;
      if(owned_value >= 8) bank_icon = goldHeart;
      if(owned_value >= 9) bank_icon = platinumHeart;
      if(owned_value >= 10) bank_icon = diamondHeart;

      // Achievements Icon is based on thresholds from all achievements
      let achievement_points = row.achieve_your_value + row.achieve_talks_a_lot + row.achieve_owned_value + row.achieve_buy_the_bot + row.achieve_go_fishing + row.achieve_chats_a_lot + row.achieve_catch_a_karp + row.Fishmonger;
      let achievement_points_icon = redHeart;
      if(achievement_points >= 10) achievement_points_icon = bronzeHeart;
      if(achievement_points >= 20) achievement_points_icon = silverHeart;
      if(achievement_points >= 35) achievement_points_icon = goldHeart;
      if(achievement_points >= 50) achievement_points_icon = platinumHeart;
      if(achievement_points == 62) achievement_points_icon = diamondHeart;

      // Messages Icon is based on row.achieve_talks_a_lot
      let messages_sent = row.achieve_talks_a_lot;
      let messages_icon = redHeart;
      if(messages_sent >= 6) messages_icon = bronzeHeart;
      if(messages_sent >= 7) messages_icon = silverHeart;
      if(messages_sent >= 8) messages_icon = goldHeart;
      if(messages_sent >= 9) messages_icon = platinumHeart;
      if(messages_sent >= 10) messages_icon = diamondHeart;

      // VCTime Icon is based on row.achieve_chats_a_lot
      let voice_time = row.achieve_chats_a_lot;
      let vctime_icon = redHeart;
      if(voice_time >= 6) vctime_icon = bronzeHeart;
      if(voice_time >= 7) vctime_icon = silverHeart;
      if(voice_time >= 8) vctime_icon = goldHeart;
      if(voice_time >= 9) vctime_icon = platinumHeart;
      if(voice_time >= 10) vctime_icon = diamondHeart;

      // Fish Caught Icon is based on row.achieve_go_fishing
      let fish_caught = row.achieve_go_fishing;
      let fishcaught_icon = redHeart;
      if(fish_caught >= 6) fishcaught_icon = bronzeHeart;
      if(fish_caught >= 7) fishcaught_icon = silverHeart;
      if(fish_caught >= 8) fishcaught_icon = goldHeart;
      if(fish_caught >= 9) fishcaught_icon = platinumHeart;
      if(fish_caught >= 10) fishcaught_icon = diamondHeart;

      // Fish Sold Icon is based on row.achieve_fishmonger
      let fish_sold = row.achieve_fishmonger;
      let fishsold_icon = redHeart;
      if(fish_sold >= 6) fishsold_icon = bronzeHeart;
      if(fish_sold >= 7) fishsold_icon = silverHeart;
      if(fish_sold >= 8) fishsold_icon = goldHeart;
      if(fish_sold >= 9) fishsold_icon = platinumHeart;
      if(fish_sold >= 10) fishsold_icon = diamondHeart;


      let vcTime = row.voicetime;
      let vcTimeFormat = "";
      if(vcTime >= (60*24*1000)){
        let vcTime2 = Math.floor(vcTime / 60*24);
        vcTimeFormat = vcTime2.format(0) + " day";
        if(vcTime2 >= 2) vcTimeFormat += "s";
        vcTimeFormat += " ";
        vcTime = vcTime - (vcTime2 * 60 * 24);
      }
      if(vcTime >= 60){
        let vcTime3 = Math.floor(vcTime / 60);
        vcTimeFormat = vcTime3 + " hour";
        if(vcTime3 >= 2) vcTimeFormat += "s";
        vcTimeFormat += " ";
        vcTime = vcTime - (vcTime3 * 60);
      }
      vcTimeFormat += vcTime + " minute";
      if(vcTime >= 2) vcTimeFormat += "s";

      let profileBox = [];
      profileBox.push(`**Current Owner**: ${ownerName}`);
      profileBox.push(`${bank_icon} **Current Bank**: \$${row.money.format(0)}`);
      profileBox.push(`${value_icon} **Current Value**: \$${row.cost.format(0)}`);
      profileBox.push(`${achievement_points_icon} **Achievement Points**: ${achievement_points.format(0)}`);
      profileBox.push(`${messages_icon} **Messages Sent**: ${row.messagesSent.format(0)}`);
      profileBox.push(`${vctime_icon} **Time in Voice Chat**: ${vcTimeFormat}`);
      profileBox.push(`${fishcaught_icon} **Fish Caught**: ${row.goneFishing.format(0)}`);
      profileBox.push(`${fishsold_icon} **Fish Sold**: ${row.soldFish.format(0)}`);

      let profile = new Discord.RichEmbed()
        .setColor(`#DA5020`)
        .setThumbnail(`${message.guild.member(target).user.avatarURL}`)
        .addField(`Profile of ${message.guild.member(target).user.username}#${message.guild.members.get(target).user.discriminator}`, `${profileBox.join('\n')}`)
        .setFooter(`Use #discord-love-ideas to put your suggestions!`);
      message.channel.send({embed:profile});
      let sql = `UPDATE users SET lastprofile = '${now}' WHERE id = ${message.author.id}`;
      db.run(sql, [], (err) => {
        if(err) return console.error(err.message);
      });
      if(target == message.author.id)
        achievement_self_worth(message, client);
    }
  });

  let embed = new Discord.RichEmbed()
    .setColor(`#6D0A0A`)
    .setAuthor(`${message.author.username} used command 'profile'`, message.author.avatarURL)
    .setFooter(`Command Used`)
    .setTimestamp();
  //client.channels.get(config.commands).send({embed});
};

exports.conf = {
  aliases: [],
  permLevel: 0
};

exports.help = {
  name: "profile",
  description: "Displays your profile",
  usage: "profile"
}
