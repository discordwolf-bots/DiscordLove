const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);

Number.prototype.format = function(n, x) {
  var re = '(\\d)(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
  return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$1,');
};

exports.run = async function(client, message, args){

  if(!args[0]){
    client.user.setPresence({
      game : {
        name : `on ${client.guilds.size.format(0)} servers`,
        type: 0
      }
    });
  }
  if(args[0]){
    if(args[0] == 'start'){
      client.user.setPresence({
        game : {
          name : `Live Coding for ${client.guilds.size.format(0)} servers`,
          type: `STREAMING`,
          url: `https://twitch.tv/discordwolf`
        }
      });
    }
  } else {
    client.user.setPresence({
      game : {
        name : `on ${client.guilds.size.format(0)} servers`,
        type: 0
      }
    });
  }
  console.log(client.user.presence);

};

exports.conf = {
  aliases: [],
  permLevel: 4
};

exports.help = {
  name: "stream",
  description: "Ping/Pong Command",
  usage: "stream <on/off>"
}
