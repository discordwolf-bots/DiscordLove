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

const achievement_self_worth = (message) => {
  let sql = `SELECT * FROM users WHERE id = ${message.author.id}`;
  db.get(sql, (err, row) => {
    if(err) return console.error(err.message);
    let value = row.cost;
    let self_worth_progress = row.achieve_your_value;
    let achieved = 0;
    if(value > 1000)
      if(self_worth_progress < 1)
        achieved = 1;
    if(value > 2500)
      if(self_worth_progress < 2)
        achieved = 2;
    if(value > 5000)
      if(self_worth_progress < 3)
        achieved = 3;
    if(value > 10000)
      if(self_worth_progress < 4)
        achieved = 4;
    if(value > 20000)
      if(self_worth_progress < 5)
        achieved = 5;
    if(value > 50000)
      if(self_worth_progress < 6)
        achieved = 6;
    if(value > 100000)
      if(self_worth_progress < 7)
        achieved = 7;
    if(value > 250000)
      if(self_worth_progress < 8)
        achieved = 8;
    if(value > 500000)
      if(self_worth_progress < 9)
        achieved = 9;
    if(value > 1000000)
      if(self_worth_progress < 10)
        achieved = 10;
    if(achieved > 0){
      let rewards = 0;
      for(let i=self_worth_progress;i<=achieved;i++){
        if(i == 1) rewards += 500;
        if(i == 2) rewards += 1000;
        if(i == 3) rewards += 1500;
        if(i == 4) rewards += 2000;
        if(i == 5) rewards += 2500;
        if(i == 6) rewards += 5000;
        if(i == 7) rewards += 7500;
        if(i == 8) rewards += 10000;
        if(i == 9) rewards += 15000;
        if(i == 10) rewards += 25000;
      }
      let embed = new Discord.RichEmbed()
        .setColor('#4DBF42')
        .setAuthor(`Achievement Gained! - \$${rewards} added!`, message.author.avatarURL)
        .setFooter(`Gained ${achieved-self_worth_progress} Levels on the Self Worth achievement`);
      message.channel.send(embed);
      let newBalance = row.money + rewards;
      let sqlUpdate = `UPDATE users SET money = ${newBalance} WHERE id = ${message.author.id}`;
      db.run(sqlUpdate, (err) => {
        if(err) return console.error(err.message);
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
      let profile = new Discord.RichEmbed()
        .setColor(`#DA5020`)
        .setTitle(`Profile of ${message.guild.member(target).user.username}#${message.guild.members.get(target).user.discriminator}`)
        .setThumbnail(`${message.guild.member(target).user.avatarURL}`)
        .addField(`Current Bank`, `**\$** ${row.money.format(0)}`, true)
        .addField(`Current Value`, `**\$** ${row.cost.format(0)}`, true)
        .addField(`Current Owner`, `${ownerName}`)
        .setFooter(`Update coming soon: Achievements`);
      message.channel.send({embed:profile});
      let sql = `UPDATE users SET lastprofile = '${now}' WHERE id = ${message.author.id}`;
      db.run(sql, [], (err) => {
        if(err) return console.error(err.message);
      });
      achievement_self_worth(message);
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
