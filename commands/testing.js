const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);
const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./utils/users.db', sqlite3.OPEN_READWRITE, (err) => {
  if(err) return console.error(err.message);
  console.log(`Connected to DB - TESTING`);
});

const guild_info = (guild, extras) => {
  let sql;
  if(extras == '') sql = `SELECT * FROM guilds WHERE guild_identifier = ${guild}`;
  if(extras != '') sql = `SELECT * FROM guilds WHERE guild_identifier = ${guild} ${extras}`;
  console.log(sql);
  db.get(sql, (err, row) => {
    if(err) return console.error(`message.js - ${err.message}`);
    console.log(row);
    return row;
  });
}

const user_info = (user, extras) => {
  let sql;
  if(extras == '') sql = `SELECT * FROM users WHERE user_discord = ${user}`;
  if(extras != '') sql = `SELECT * FROM users WHERE user_discord = ${user} ${extras}`;
  db.get(sql, (err, row) => {
    if(err) return console.error(`message.js - ${err.message}`);
    return row;
  })
}

exports.run = function(client, message, args){
  let guild = guild_info(message.guild.id, '');
  let user = user_info(message.author.id, '');

  console.log(guild);
  console.log(user);
};

exports.conf = {
  aliases: [],
  permLevel: 4
};

exports.help = {
  name: "testing",
  description: "Ping/Pong Command",
  usage: "ping"
}
