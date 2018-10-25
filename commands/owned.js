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

  let sqlCheck = `SELECT * FROM users WHERE id = ${message.author.id}`;
  db.get(sqlCheck, [], (err,row) => {
    if(err) return console.error(err.message);
    if(!row) return message.channel.send(`Please do ${config.prefix}profile first!`);

    let sqlCheckOwner = `SELECT * FROM users WHERE owner = ${message.author.id}`;
    db.all(sqlCheckOwner, [], (err, rows) => {
      let rowCount = 0;
      rows.forEach((row) => {
        rowCount++;
      });
      message.channel.send(`You currently own **${rowCount}** users.`);
    });
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
  name: "owned",
  description: "Displays who you own",
  usage: "owned"
}
