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
          if(i == j) rewards += parseInt(config.reward_self_worth.split(',')[j-1]);
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
  let now = moment().format('DDMMYYhhmmss');
  if(message.mentions.members.first()) target = message.mentions.members.first().user.id;
  let sqlCheck = `SELECT * FROM users WHERE id = ${target}`;
  db.get(sqlCheck, [], (err,row) => {
    if(err) return console.error(err.message);
    if(!row){
      if(target != message.author.id) return message.channel.send(`This user needs to setup their own profile.`);
      return message.channel.send(`Please do the command **${config.prefix}start** in ${message.guild.channels.get('505128715202723850').toString()} first!`);
    } else {

      if(now - parseInt(row.lastprofile) < 60){ message.delete(); return message.reply(`Please wait another **${60 - (now - parseInt(row.lastprofile))}** seconds.`); }
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
      let achievement_points = row.achieve_your_value + row.achieve_talks_a_lot + row.achieve_owned_value + row.achieve_buy_the_bot;
      let achievement_points_icon = `<:heart_red:505752941932838912>`;
      if(achievement_points >= 5) achievement_points_icon = `<:heart_bronze:505750301614276618>`;
      if(achievement_points >= 10) achievement_points_icon = `<:heart_silver:505750301341515779>`;
      if(achievement_points >= 15) achievement_points_icon = `<:heart_gold:505750302226645003>`;
      if(achievement_points >= 20) achievement_points_icon = `<:heart_platinum:505750302796939283>`;
      if(achievement_points == 31) achievement_points_icon = `<:heart_diamond:505750302863917056>`;

      let vcTime = row.voicetime;
      let vcTimeFormat = "";
      if(vcTime >= (60*24)){
        let vcTime2 = Math.floor(vcTime / 60*24);
        vcTimeFormat = vcTime2.format(0) + " day";
        if(vcTime2 >= 2) vcTimeFormat += "s";
        vcTimeFormat += " ";
        vcTime = vcTime - (vcTime2 * 60 * 24);
      }
      if(vcTime >= 60){
        let vcTime3 = Math.floor(vcTime / 60);
        vcTimeFormat = vcTime3 + "hour";
        if(vcTime3 >= 2) vcTimeFormat += "s";
        vcTimeFormat += " ";
        vcTime = vcTime - (vcTime3 * 60);
      }
      vcTimeFormat += vcTime + " minute";
      if(vcTime >= 2) vcTimeFormat += "s";

      let profile = new Discord.RichEmbed()
        .setColor(`#DA5020`)
        .setTitle(`Profile of ${message.guild.member(target).user.username}#${message.guild.members.get(target).user.discriminator}`)
        .setThumbnail(`${message.guild.member(target).user.avatarURL}`)
        .addField(`Current Bank`, `**\$** ${row.money.format(0)}`, true)
        .addField(`Current Value`, `**\$** ${row.cost.format(0)}`, true)
        .addField(`Current Owner`, `${ownerName}`)
        .addField(`Achievement Points`, `${achievement_points_icon} ${achievement_points.format(0)}`)
        .addField(`Messages Sent`, `${row.messagesSent.format(0)}`, true)
        .addField(`Time in VC`, `${vcTimeFormat}`, true)
        .setFooter(`More Achievements hopefully coming soon! **Rewards for ideas!**`);
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
