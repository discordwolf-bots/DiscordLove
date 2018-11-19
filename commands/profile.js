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
  message.delete();
  let sql = `SELECT * FROM guilds WHERE guild_identifier = ${message.guild.id}`;
  db.get(sql, [], (err, row) => {
    if(err) return console.error(err.message);
    if(!row) return message.reply(`You do not have a profile yet!`);
    message.reply(row.guild_owner);
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
