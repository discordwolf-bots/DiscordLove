const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);

const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./utils/users.db', sqlite3.OPEN_READWRITE, (err) => {
  if(err){
    console.error(err.message);
  }
  console.log(`Connected to DB - Affordable`);
});

Number.prototype.format = function(n, x) {
  var re = '(\\d)(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
  return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$1,');
};

exports.run = function(client, message, args){
  let now = moment().format('x');
  let sql1 = `SELECT * FROM users WHERE id = ${message.author.id}`;
  db.get(sql1, (err, row) => {
    if(err) return console.error(err.message);
    if(!row) return message.reply(`You need a profile first`);
    
  });
};

exports.conf = {
  aliases: ['icanbuy'],
  permLevel: 4
};

exports.help = {
  name: "affordable",
  description: "Displays the users you can currently afford",
  usage: "affordable"
}
