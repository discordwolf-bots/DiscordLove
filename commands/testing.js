const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);
const sqlite3 = require('sqlite3').verbose();

exports.run = async function(client, message, args){

  client.guild_info(message.guild.id, '', (guild) => {
    client.user_info(message.author.id, '', (user) => {
      if(!guild || !user) return;
      console.log(user);
      message.reply(`Money: ${user.user_money} (${parseFloat(user.user_money)} ${typeof parseFloat(user.user_money)})`)
    });
  });

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
