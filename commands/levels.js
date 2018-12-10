const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);

Number.prototype.format = function(n, x) {
  var re = '(\\d)(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
  return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$1,');
};

exports.run = function(client, message, args, user, guild){

  if(!user) return message.reply(`Please start your profile in <#${guild.channel_setup}>`)
  if(!guild) return message.reply(`Please tell an admin to re-invite the bot to the server.`)

  let embed_colour = '#' + user.user_colour;
  if(user.user_colour == 'RAND') embed_colour = '#' + Math.floor(Math.random()*16777215).toString(16);

  let embed = new Discord.RichEmbed()
    .setColor(embed_colour)
    .setAuthor(`Levels for ${message.member.displayName}`)
    .setTimestamp()

    .addField(`Prestige Level`, `\`\`\`${user.prestige_level}\`\`\``, true)
    .addField(`Max Level`, `\`\`\`${user.prestige_level < 5 ? `${(user.prestige_level+1)*20}` : `No Max`}\`\`\``, true)
    .addField(`<${config.chatting_badge}> Chatting Level`, `\`\`\`${user.user_level.format(0)}\`\`\``, true)
    .addField(`<${config.fishing_token}> Fishing Level`, `\`\`\`${user.experience_fishing_level.format(0)}\`\`\``, true)
    .addField(`<${config.mining_token}> Mining Level`, `\`\`\`${user.experience_mining_level.format(0)}\`\`\``, true)
    .addField(`<${config.woodcutting_token}> Woodcutting Level`, `\`\`\`${user.experience_woodcutting_level.format(0)}\`\`\``, true);

  message.channel.send(embed);


}

exports.conf = {
  aliases: ['lvl', 'level'],
  permLevel: 0
};

exports.help = {
  name: "levels",
  description: "Displays your levels",
  usage: "levels"
}
