const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);

exports.run = function(client, message, args){
  message.delete();
  message.channel.send(`ヽ( •_)ᕗ`);
};

exports.conf = {
  aliases: [],
  permLevel: 0
};

exports.help = {
  name: "dab",
  description: "Dab Command",
  usage: "dab"
}
