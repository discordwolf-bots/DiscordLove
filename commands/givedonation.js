const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);

Number.prototype.format = function(n, x) {
  var re = '(\\d)(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
  return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$1,');
};

exports.run = function(client, message, args, user, guild){
  message.delete();
  let now = moment().format('x'); // Current UNIX Timestamp
  let target = message.mentions.users.first();
  if(!target) return message.reply(`Please mention somebody to give premium coins to`);
  if(!args[1]) return message.reply(`Please specify an amount that the user donated`);
  client.guild_info(message.guild.id, '', (guild) => {
    // Has this server been added to the guild Database?
    if(!guild) return message.reply(`Please re-invite the bot`);
    client.user_info(target.id, '', (user_target) => {
      // Does this user have a profile?
      if(!user_target){
        return message.reply(`This user has not started their DiscordLove profile`);
      }
      let sql_add_coins = `UPDATE users SET user_amount_donated = ${user_target.user_amount_donated + parseFloat(args[1])} WHERE user_discord = ${target.id}`;
      client.db.run(sql_add_coins, [], (err) => {
        if(err) return console.error(err.message);
        message.reply(`${target} has had their donation amount increased by **£${Math.floor(args[1]).format(2)}**`);
      });
    });
  });
};

exports.conf = {
  aliases: [],
  permLevel: 4
};

exports.help = {
  name: "givedonation",
  description: "Adds a users donation amount to their total",
  usage: "givedonation <@user> <amount>"
}
