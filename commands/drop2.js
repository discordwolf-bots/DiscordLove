const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);

const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./utils/users.db', sqlite3.OPEN_READWRITE, (err) => {
  if(err){
    console.error(err.message);
  }
  console.log(`Connected to DB - Drop`);
});

exports.run = function(client, message, args){

  let sql = `DROP TABLE guilds`;
  db.run(sql, (err) => {
    if(err){
      return console.error(err.message);
    }
    console.log(`Table deleted`);
  });
};

exports.conf = {
  aliases: [],
  permLevel: 4
};

exports.help = {
  name: "drop",
  description: "Deletes Table",
  usage: "drop"
}
