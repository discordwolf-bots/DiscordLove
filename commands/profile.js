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


Number.prototype.format = function(n, x) {
  var re = '(\\d)(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
  return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$1,');
};

exports.run = function(client, message, args){

  let target = message.author.id;
  if(message.mentions.members.first()) target = message.mentions.members.first().user.id;

  let sqlCheck = `SELECT * FROM users WHERE id = ${target}`;
  console.log(sqlCheck);
  db.get(sqlCheck, [], (err,row) => {
    if(err) return console.error(err.message);
    if(!row){ // NEW USER
      let sqlInsert = `INSERT INTO users (id) VALUES (${target})`;
      db.run(sqlInsert, [], (err) => {
        if(err) return console.error(err.message);
        let profile = new Discord.RichEmbed()
          .setColor(`#DA5020`)
          .setTitle(`Profile of ${message.guild.member(target).user.username}`)
          .setThumbnail(`${message.guild.member(target).user.avatarURL}`)
          .addField(`Current Bank`, `**\$** 5,000`, true)
          .addField(`Current Value`, `**\$** 100`, true)
          .addField(`Current Owner`, `None`);
        message.channel.send({embed:profile});
        console.log(`New user added : ${target}`);
      });
    }
  });

  let sqlFetch = `SELECT * FROM users WHERE id = ${target}`;
  db.get(sqlFetch, [], (err, row) => {
    if(row){
      let owner = row.owner.toString();
      let ownerName = "None";
      // if(owner != 0) ownerName = message.guild.members.get(owner).user.username;
      let profile = new Discord.RichEmbed()
        .setColor(`#DA5020`)
        .setTitle(`Profile of ${message.guild.member(target).user.username}`)
        .setThumbnail(`${message.guild.member(target).user.avatarURL}`)
        .addField(`Current Bank`, `**\$** ${row.money.format(0)}`, true)
        .addField(`Current Value`, `**\$** ${row.cost.format(0)}`, true)
        .addField(`Current Owner`, `${ownerName}`);
      message.channel.send({embed:profile});
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
  permLevel: 4
};

exports.help = {
  name: "profile",
  description: "Displays your profile",
  usage: "profile"
}
