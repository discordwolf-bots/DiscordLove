const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);

exports.run = function(client, message, args){
  message.delete();
  message.channel.send(`Ping?`)
    .then(msg => {
      msg.edit(`Pong! (took: ${msg.createdTimestamp - message.createdTimestamp}ms)`);
    });
};

exports.conf = {
  aliases: [],
  permLevel: 0
};

exports.help = {
  name: "ping",
  description: "Ping/Pong Command",
  usage: "ping"
}
