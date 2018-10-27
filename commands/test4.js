const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);

const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./utils/users.db', sqlite3.OPEN_READWRITE, (err) => {
  if(err){
    console.error(err.message);
  }
  console.log(`Connected to DB - Build`);
});

exports.run = function(client, message, args){
//482644639988580352
  let sql = `SELECT * FROM users WHERE id = ${message.author.id}`;
  db.get(sql, (err, row) => {
    if(err) return console.error(err.message);
    let sql2 = `UPDATE users SET money = ${row.money - 500} WHERE id = ${row.id}`;
    db.run(sql2, (err) => {
      if(err) return console.error(err.message)
      message.channel.send(`Money reduced by \$$500 for user ${message.guild.members.get(row.id).user.username}#${message.guild.members.get(row.id).user.discriminator}`);
    });
  });

  sql = `SELECT * FROM users WHERE id = '482644639988580352'`;
  db.get(sql, (err, row) => {
    if(err) return console.error(err.message);
    sql2 = `UPDATE users SET money = ${row.money - 500} WHERE id = ${row.id}`;
    db.run(sql2, (err) => {
      if(err) return console.error(err.message)
      message.channel.send(`Money reduced by \$$500 for user ${message.guild.members.get(row.id).user.username}#${message.guild.members.get(row.id).user.discriminator}`);
    });
  });

};

exports.conf = {
  aliases: [],
  permLevel: 4
};

exports.help = {
  name: "test4",
  description: "Wolfs current test command",
  usage: "test4"
}
