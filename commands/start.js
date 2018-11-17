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
  if(message.channel.name != 'discord-love-setup') return message.channel.send(`Please do the command **${config.prefix}start** in **discord-love-setup** first!`);
  let sql = `SELECT * FROM users WHERE user_discord = ${message.author.id}`;
  db.get(sql, [], (err, row) => {
    if(err) return console.error(err.message);
    if(!row) {
      let sqlInsert = `INSERT INTO users (user_discord) VALUES (${message.author.id})`;
      db.run(sqlInsert, [], (err) => {
        if(err) return console.error(err.message);
        message.reply(`User profile created.`);
        let discord_love_role = message.guild.roles.find("name", "DiscordLoved");
        if(!discord_love_role) return message.channel.send(`Please create the role \`\`DiscordLoved\`\``);
        message.guild.members.get(message.author.id).addRole(discord_love_role.id);
        console.log(`New user added : ${message.author.id}`);
      });
    } else {
      message.reply(`You already have a profile! You dont need to set up again.`);
    }
  });
};

exports.conf = {
  aliases: [],
  permLevel: 4
};

exports.help = {
  name: "start",
  description: "Starts your DiscordLove journey",
  usage: "start"
}
