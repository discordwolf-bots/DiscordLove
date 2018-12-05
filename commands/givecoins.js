const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);

Number.prototype.format = function(n, x) {
  var re = '(\\d)(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
  return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$1,');
};

exports.run = function(client, message, args){
  message.delete();
  let now = moment().format('x'); // Current UNIX Timestamp
  let target = message.mentions.users.first();
  if(!target) return message.reply(`Please mention somebody to give premium coins to`);
  if(!args[1]) return message.reply(`Please specify an amount of coins to give`);
  client.guild_info(message.guild.id, '', (guild) => {
    // Has this server been added to the guild Database?
    if(!guild) return message.reply(`Please re-invite the bot`);
    client.user_info(target.id, '', (user) => {
      // Does this user have a profile?
      if(!user){
        return message.reply(`This user has not started their DiscordLove profile`);
      }
      let sql_add_coins = `UPDATE users SET user_premium_coins = ${user.user_premium_coins + Math.floor(args[1])} WHERE user_discord = ${target.id}`;
      client.db.run(sql_add_coins, [], (err) => {
        if(err) return console.error(err.message);
        message.reply(`${target} has been given **${Math.floor(args[1]).format(0)}** Premium Coins.`);
      });
    });
  });
};

exports.conf = {
  aliases: [],
  permLevel: 4
};

exports.help = {
  name: "givecoins",
  description: "Gives an account premium coins",
  usage: "givecoins <@user>"
}
