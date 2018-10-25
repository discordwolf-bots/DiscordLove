const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);

exports.run = function(client, message, args){
  let id = 157085410684698624;
  let idT = '157085410684698624';

  console.log(typeof message.author.id.toString());
  console.log(typeof id.toString());
  console.log(message.guild.members.get(idT.toString()));

};

exports.conf = {
  aliases: [],
  permLevel: 0
};

exports.help = {
  name: "test",
  description: "Ping/Pong Command",
  usage: "test"
}
