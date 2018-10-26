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

  let sql = `CREATE TABLE IF NOT EXISTS users (
    id TEXT,
    userID INTEGER PRIMARY KEY ASC,
    money INTEGER DEFAULT 100,
    cost INTEGER DEFAULT 100,
    owner TEXT DEFAULT 0,
    lastpurchase TEXT DEFAULT 0,
    lastprofile TEXT DEFAULT 0
  )`;
  db.run(sql, (err) => {
    if(err){
      return console.error(err.message);
    }
    console.log(`Table created`);
  });

  let embed = new Discord.RichEmbed()
    .setColor(`#6D0A0A`)
    .setAuthor(`${message.author.username} used command 'ping'`, message.author.avatarURL)
    .setFooter(`Command Used`)
    .setTimestamp();
  //client.channels.get(config.commands).send({embed});
};

exports.conf = {
  aliases: [],
  permLevel: 4
};

exports.help = {
  name: "build",
  description: "Builds Databse",
  usage: "build"
}
