const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);

const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./utils/users.db', sqlite3.OPEN_READWRITE, (err) => {
  if(err){
    console.error(err.message);
  }
  console.log(`Connected to DB - Start`);
});

exports.run = function(client, message, args){
  message.delete();
  if(message.channel.id != '505128715202723850') return message.channel.send(`Please do the command **${config.prefix}start** in ${message.guild.channels.get('505128715202723850').toString()} first!`);
  let sql = `SELECT * FROM users WHERE id = ${message.author.id}`;
  db.get(sql, [], (err, row) => {
    if(err) return console.error(err.message);
    if(!row) {
      let sqlInsert = `INSERT INTO users (id) VALUES (${message.author.id})`;
      db.run(sqlInsert, [], (err) => {
        if(err) return console.error(err.message);
        message.reply(`User profile created.`);
        message.guild.members.get(message.author.id).addRole('505131540150222849');
        console.log(`New user added : ${message.author.id}`);
      });
    } else {
      message.reply(`You already have a profile! You dont need to set up again.`);
    }
  });
};

exports.conf = {
  aliases: [],
  permLevel: 0
};

exports.help = {
  name: "start",
  description: "Starts your DiscordLove journey",
  usage: "start"
}
