const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);

Number.prototype.format = function(n, x) {
  var re = '(\\d)(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
  return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$1,');
};

exports.run = function(client, message, args, user, guild){
  if(!guild) return message.reply(`Please re-invite the bot`);
  message.delete();
  let now = moment().format('x'); // Current UNIX Timestamp
  let target = message.mentions.users.first();
  if(!target) return message.reply(`Please mention somebody to give premium coins to`);
  if(!args[1]) return message.reply(`Please specify a title to give to the user`);

  client.user_info(target.id, '', (user_target) => {
    // Does this user have a profile?
    if(!user_target){
      return message.reply(`This user has not started their DiscordLove profile`);
    }

    let has_title = false;

    if(user_target.user_titles){
      if(user_target.user_titles.length > 0){
        let user_titles_current = user_target.user_titles.split(',');
        for(let i=0; i<user_titles_current.length; i++){
          console.log(user_titles_current[i]);
          if(parseInt(user_titles_current[i]) == parseInt(args[1])){
            has_title = true;
          }
        }
      }
    }

    if(has_title){
      return message.reply(`This user already has this title`);
    }

    let sql_add_coins = `UPDATE users SET user_titles = '${user_target.user_titles + `,${args[1]}`}' WHERE user_discord = ${target.id}`;
    client.db.run(sql_add_coins, [], (err) => {
      if(err) return console.error(err.message);
      client.title_info(parseInt(args[1]), '', (title) => {
        message.reply(`${target} been given Title #${args[1]} **${title.title_text}**`);
      })

    });
  });
};

exports.conf = {
  aliases: [],
  permLevel: 4
};

exports.help = {
  name: "givetitle",
  description: "Gives a user a title",
  usage: "givetitle <@user> <title number>"
}
