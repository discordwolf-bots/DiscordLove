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

    voicejoined TEXT DEFAULT 0,
    voicetime INTEGER DEFAULT 0,

    lastpurchase TEXT DEFAULT 0,
    lastprofile TEXT DEFAULT 0,
    lastmessage TEXT DEFAULT 0,
    lastfish TEXT DEFAULT 0,

    messagesSent INTEGER DEFAULT 0,

    goneFishing INTEGER DEFAULT 0,
    soldFish INTEGER DEFAULT 0,
    magikarpCaught INTEGER DEFAULT 0,

    achieve_your_value INTEGER DEFAULT 0,
    achieve_owned_value INTEGER DEFAULT 0,
    achieve_buy_the_bot INTEGER DEFAULT 0,
    achieve_talks_a_lot INTEGER DEFAULT 0,
    achieve_go_fishing INTEGER DEFAULT 0,
    achieve_chats_a_lot INTEGER DEFAULT 0,
    achieve_catch_a_karp INTEGER DEFAULT 0,
    achieve_fishmonger INTEGER DEFAULT 0
  )`;
  db.run(sql, (err) => {
    if(err){
      return console.error(err.message);
    }
    message.channel.send(`New table created - users`);
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
  aliases: ['2'],
  permLevel: 4
};

exports.help = {
  name: "build",
  description: "Builds Databse",
  usage: "build"
}
