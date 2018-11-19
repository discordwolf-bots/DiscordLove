const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);

exports.run = function(client, message, args){
  let guild = client.guild_info(message.guild.id);
  let user = client.user_info(message.author.id);

  console.log(client.guild_info(message.guild.id).guild_owner);
  console.log(guild);
  console.log(user);
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
