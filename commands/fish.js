const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);

const go_fishing = (user, message) => {

}

exports.run = function(client, message, args){
  client.guild_info(message.guild.id, '', (guild) => {
    client.user_info(message.author.id, '', (user) => {
      if(!guild) return message.reply(`Please re-invite the bot`);
      if(!user) return message.reply(`Please start your account`);

      let check_channel = true;
      if(user.user_discord == config.botowner) check_channel = false;
      if(guild.channel_main != message.channel.id && check_channel){
        message.delete();
        return message.reply(`Please only use this command in <#${guild.channel_main}>`)
      }

      let now = moment().format('x');

    });
  });
};

exports.conf = {
  aliases: [],
  permLevel: 4
};

exports.help = {
  name: "fish",
  description: "Starts fishing",
  usage: "fish"
}
