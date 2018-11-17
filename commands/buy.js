const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);

const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./utils/users.db', sqlite3.OPEN_READWRITE, (err) => {
  if(err){
    console.error(err.message);
  }
  console.log(`Connected to DB - Buy`);
});

const achievement_expensive_taste = (message, value, client) => {
  let sql = `SELECT * FROM users WHERE id = ${message.author.id}`;
  db.get(sql, (err, row) => {
    if(err) return console.error(err.message);
    let expensive_taste_progress = row.achieve_owned_value;
    let achieved = 0;

    for(let i=0; i<config.thresh_expensive_taste.length; i++){
      if(value >= parseInt(config.thresh_expensive_taste.split(',')[i]))
        if(expensive_taste_progress < i+1)
          achieved = i+1;
    }

    if(achieved > 0){
      let rewards = 0;
      for(let i=expensive_taste_progress;i<=achieved;i++){
        for(let j=1; j<=config.thresh_expensive_taste.length; j++){
          if(i == j) rewards += parseInt(config.rewards.split(',')[j-1]);
        }
      }
      let embed = new Discord.RichEmbed()
        .setColor('#4DBF42')
        .setAuthor(`Achievement Gained! - \$${rewards} added!`, message.author.avatarURL)
        .setFooter(`Gained ${achieved-expensive_taste_progress} Levels on the Expensive Taste achievement`);
      message.channel.send(embed);
      let newBalance = row.money + rewards;
      client.channels.get(config.logging).send(`:busts_in_silhouette: ACHIEVEMENT EXPENSIVE TASTE : ${message.author.username}#${message.author.discriminator} - ${row.money} -> ${newBalance}`);
      let sqlUpdate = `UPDATE users SET money = ${newBalance}, achieve_owned_value = ${achieved} WHERE id = ${message.author.id}`;
      db.run(sqlUpdate, (err) => {
        if(err) return console.error(err.message);
      });
    }
  });
}

const achievement_buy_a_bot = (message, client) => {
  let sql = `SELECT * FROM users WHERE id = ${message.author.id}`;
  db.get(sql, (err, row) => {
    if(err) return console.error(err.message);
    let buy_the_bot_progress = row.achieve_buy_the_bot;
    if(buy_the_bot_progress == 0){
      let sqlUpdate = `UPDATE users SET money = ${row.money+2500}, achieve_buy_the_bot = 1 WHERE id = ${message.author.id}`;
      let embed = new Discord.RichEmbed()
        .setColor('#4DBF42')
        .setAuthor(`Achievement Gained! - \$2,500 added!`, message.author.avatarURL)
        .setFooter(`Completed Hidden achievement`);
      message.channel.send(embed);
      client.channels.get(config.logging).send(`ACHIEVEMENT BUY A BOT : ${message.author.username}#${message.author.discriminator} - ${row.money} -> ${row.money+2500}`);
      db.run(sqlUpdate, (err) => {
        if(err) return console.error(err.message);
      });
    } else {
      message.channel.send(`Stop trying to buy bots!`);
    }
  });
}

Number.prototype.format = function(n, x) {
  var re = '(\\d)(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
  return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$1,');
};

exports.run = function(client, message, args){
  message.delete();
  let sql = `SELECT * FROM users WHERE id = ${message.author.id}`;
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
  name: "buy",
  description: "Buys a user",
  usage: "buy"
}
