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
    .setAuthor(`Currencies for ${message.member.displayName}`)
    .setTimestamp()

    .addField(`<${config.banker}> Bank (${user.user_cps} BPS)`, `\`\`\`$${user.user_money.format(2)}\`\`\``, true)
    .addField(`<${config.premium_token}> Premium Coins`, `\`\`\`${user.user_premium_coins.format(0)}\`\`\``, true)
    .addField(`<${config.diamond}> Diamonds`, `\`\`\`${user.user_diamonds.format(0)}\`\`\``, true)
    .addField(`<${config.fishing_token}> Fishing Tokens`, `\`\`\`${user.gathering_fish.format(0)}\`\`\``, true)
    .addField(`<${config.woodcutting_token}> Woodcutting Tokens`, `\`\`\`${user.gathering_logs.format(0)}\`\`\``, true)
    .addField(`<${config.mining_token}> Mining Tokens`, `\`\`\`${user.gathering_ore.format(0)}\`\`\``, true);

  message.channel.send(embed);


}

exports.conf = {
  aliases: ['cur', 'currency'],
  permLevel: 0
};

exports.help = {
  name: "currencies",
  description: "Displays your currencies",
  usage: "currencies"
}
