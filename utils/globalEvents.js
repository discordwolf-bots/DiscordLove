const chalk = require('chalk');
const Discord = require('discord.js');
const client = new Discord.Client();
const ddiff = require('return-deep-diff');
const fs = require('fs');
const moment = require('moment');

const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./utils/users.db', sqlite3.OPEN_READWRITE, (err) => {
  if(err){
    console.error(err.message);
  }
  console.log(`Connected to DB - Index`);
});

const guild_info = (guild, db) => {
  let sql = `SELECT * FROM guilds WHERE guild_identifier = ${guild}`;
  db.get(sql, (err, row) => {
    if(err) return console.error(`message.js - ${err.message}`);
    console.log(chalk.bold.red(`global.guild_info index.js`));
    console.log(row);
    return row;
  });
}
const user_info = (user, db) => {
  let sql = `SELECT * FROM users WHERE user_discord = ${user}`;
  db.get(sql, (err, row) => {
    if(err) return console.error(`message.js - ${err.message}`);
    console.log(chalk.bold.red(`global.user_info index.js`));
    console.log(row);
    return row;
  })
}

module.exports = {
  db : db,
  guild_info : guild_info,
  user_info : user_info
}
