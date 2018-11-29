const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);

exports.run = function(client, message, args){
  let sql = `DELETE FROM users WHERE user_discord = ${message.author.id}`;
  client.db.run(sql, [], (err) => {
    if(err) return console.error(err.message);
    message.channel.reply(`Account removed`);
  })
};

exports.conf = {
  aliases: [],
  permLevel: 4
};

exports.help = {
  name: "reset",
  description: "Deletes Table",
  usage: "drop"
}
