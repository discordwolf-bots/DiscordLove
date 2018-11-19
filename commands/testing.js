const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);
const sqlite3 = require('sqlite3').verbose();

exports.run = async function(client, message, args){

  client.guild_info(message.guild.id, '', (guild) => {
    client.user_info(message.author.id, '', (user) => {
      if(!guild || !user) return;

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
