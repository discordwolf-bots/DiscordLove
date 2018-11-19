const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);
const sqlite3 = require('sqlite3').verbose();

exports.run = async function(client, message, args){
  client.guild_info(message.guild.id, '').then( guild => {
    console.log(guild);
  });
  client.user_info(message.author.id, '').then( user => {
    console.log(user);
  });

  // console.log(guild);
  // console.log(user);
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
