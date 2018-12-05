const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);

exports.run = function(client, message, args){
  let now = moment().format('x');

  let day_millis = 1000 * 60 * 60 * 24;
  let hour_millis = 1000 * 60 * 60;
  let minute_millis = 1000 * 60;
  // Get how long bot has been online
  let init_timer = (parseInt(client.timeInitiated) - now) * -1;
  let init_days = 0;
  let init_hours = 0;
  let init_minutes = 0;
  let init_seconds = 0;

  // How many days?
  if(init_timer / day_millis >= 1){
    init_days = Math.floor(init_timer/day_millis);
    init_timer = init_timer - (day_millis * init_days);
  }
  // How many hours?
  if(init_timer / hour_millis >= 1){
    init_hours = Math.floor(init_timer/hour_millis);
    init_timer = init_timer - (hour_millis * init_hours);
  }
  // How many minutes?
  if(init_timer / minute_millis >= 1){
    init_minutes = Math.floor(init_timer / minute_millis);
    init_timer = init_timer - (minute_millis * init_minutes);
  }
  // How many seconds?
  if(init_timer > 0){
    init_seconds = Math.floor(init_timer/1000);
  }

  let init_format = '';
  if(init_days > 0) init_format += `${init_days} day${init_days > 1 ? 's' : ''} `;
  if(init_hours > 0) init_format += `${init_hours} hour${init_hours > 1 ? 's' : ''} `;
  if(init_minutes > 0) init_format += `${init_minutes} minute${init_minutes > 1 ? 's' : ''} `;
  if(init_seconds > 0) init_format += `${init_seconds} second${init_seconds > 1 ? 's' : ''} `;

  let embed = new Discord.RichEmbed()
    .setColor('#' + Math.floor(Math.random()*16777215).toString(16))
    .setAuthor(`DiscordLove Statistics`, client.user.avatarURL)
    .addField(`Total Commands`, `\`\`\`${client.totalCommands}\`\`\``, true)
    .addField(`Total Servers`, `\`\`\`${client.guilds.size.format(0)}\`\`\``, true)
    .addField(`Total Users`, `\`\`\`${client.totalUsers.format(0)}\`\`\``, true)
    .addField(`Time Since Last Update`, `\`\`\`${init_format}\`\`\``, true)
    .addField(`Current Version`, `\`\`\`Alpha 0.2\`\`\``, true);
  message.channel.send(embed);
};

exports.conf = {
  aliases: [],
  permLevel: 0
};

exports.help = {
  name: "info",
  description: "Display Bot Info",
  usage: "info"
}
