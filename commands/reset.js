const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);

exports.run = function(client, message, args){
  message.channel.send(`User has been successfully reset.`);
};

exports.conf = {
  aliases: [],
  permLevel: 4
};

exports.help = {
  name: "reset",
  description: "Troll",
  usage: "reset"
}
