const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);

const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./utils/users.db', sqlite3.OPEN_READWRITE, (err) => {
  if(err){
    console.error(err.message);
  }
  console.log(`Connected to DB - Achievements`);
});

Number.prototype.format = function(n, x) {
  var re = '(\\d)(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
  return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$1,');
};

exports.run = async function(client, message, args){

  let sql = `SELECT * FROM users WHERE user_discord = ${message.author.id}`;
  db.get(sql, async (err, row) => {
    if(err) return console.error(err.message);
    if(!row) return message.reply(`You need to create a profile first!`);

  });
};

exports.conf = {
  aliases: ['ach'],
  permLevel: 4
};

exports.help = {
  name: "achievements",
  description: "Displays your achievements",
  usage: "achievements"
}
