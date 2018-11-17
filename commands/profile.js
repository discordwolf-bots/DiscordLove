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
  message.delete();
  let sql = `SELECT * FROM users WHERE user_discord = ${message.author.id}`;
  db.get(sql, [], (err, row) => {
    if(err) return console.error(err.message);
    if(!row) return message.reply(`You do not have a profile yet!`);

  });
};

exports.conf = {
  aliases: [],
  permLevel: 4
};

exports.help = {
  name: "profile",
  description: "Displays your profile",
  usage: "profile"
}
