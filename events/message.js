const config = require(`../config.json`);

const Discord = require(`discord.js`);
const fs = require('fs');
const chalk = require('chalk');
const ms = require('ms');
const moment = require('moment');
const sql = require('sqlite');

module.exports = message => {
  try {
    if(message.author.bot) return;
    if(message.channel.type !== "text") return;
    const client = message.client;
    const params = message.content.split(' ').slice(1);

    var command = "";
    var bool = false;

    if(message.content.startsWith(config.prefix)){
      command = message.content.split(' ')[0].slice(config.prefix.length);
      bool = true;
    } else if(message.content.startsWith(config.prefixtext)){
      command = message.content.split(' ')[0].slice(config.prefixtext.length);
      bool = true;
    } else if(message.content.startsWith(config.prefixemoji)){
      command = message.content.split(' ')[0].slice(config.prefixemoji.length);
      bool = true;
    }

    if(bool){
      let perms = client.elevation(message);
      let cmd;
      if(client.commands.has(command)){
        cmd = client.commands.get(command);
      } else if(client.aliases.has(command)){
        cmd = client.commands.get(client.aliases.get(command));
      }
      if(cmd){
        if(perms < cmd.conf.permLevel){
          let embed = new Discord.RichEmbed()
            .setColor(`#ff0000`)
            .addField(`Error!`, `You do not have the permissions to use ${command}`)
            .setTimestamp();
          return message.channel.send({embed : embed});
        }
        cmd.run(client, message, params, perms);
      }
    }

  } catch(e) {
    console.log(e.stack);
  }
}
