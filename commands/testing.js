const functions = require(`../utils/globalEvents.js`);
const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);

exports.run = function(client, message, args){
  let db = functions.db();
  let guild = functions.guild_info(message.guild.id, db);
  let user = functions.user_info(message.author.id, db);

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
