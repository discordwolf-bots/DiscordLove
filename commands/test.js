const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);

const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./utils/users.db', sqlite3.OPEN_READWRITE, (err) => {
  if(err){
    console.error(err.message);
  }
  console.log(`Connected to DB - Test`);
});

exports.run = function(client, message, args){
  let sql = `ALTER TABLE users ADD COLUMNS achieve_your_value INTEGER DEFAULT 0, achieve_owned_value INTEGER DEFAULT 0, achieve_buy_the_bot INTEGER DEFAULT 0`;
  db.run(sql, [], (err) => {
    if(err) return console.error(err.message);
    console.log(`Table altered successfully`);
  })
};

exports.conf = {
  aliases: [],
  permLevel: 0
};

exports.help = {
  name: "test",
  description: "Ping/Pong Command",
  usage: "test"
}
