const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);

const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./utils/users.db', sqlite3.OPEN_READWRITE, (err) => {
  if(err){
    console.error(err.message);
  }
  console.log(`Connected to DB - Timerfix`);
});

exports.run = function(client, message, args){
  message.delete();
  if(!args[0]) return;
  if(args[0] == "message"){
    let sql = `UPDATE users SET lastmessage = 0`;
    db.run(sql, (err) => {
      if(err) return console.error(err.message);
      message.channel.send(`All message timers reset`);
    });
  } else if(args[0] == "buy"){
    let sql = `UPDATE users SET lastpurchase = 0`;
    db.run(sql, (err) => {
      if(err) return console.error(err.message);
      message.channel.send(`All purchase timers reset`);
    });
  } else if(args[0] == "profile"){
    let sql = `UPDATE users SET lastprofile = 0`;
    db.run(sql, (err) => {
      if(err) return console.error(err.message);
      message.channel.send(`All profile timers reset`);
    });
  }
};

exports.conf = {
  aliases: [],
  permLevel: 4
};

exports.help = {
  name: "timerfix",
  description: "Wolfs current test command",
  usage: "timerfix"
}
