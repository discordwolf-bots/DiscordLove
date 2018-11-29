const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);

exports.run = function(client, message, args){
  message.delete();
  let now = moment().format('x'); // Current UNIX Timestamp
  let target = message.mentions.users.first();
  if(!target) return message.reply(`Please mention somebody to give premium status to`);
  client.guild_info(message.guild.id, '', (guild) => {
    // Has this server been added to the guild Database?
    if(!guild){
      return message.reply(`Please re-invite the bot`);
    }
    client.user_info(target.id, '', (user) => {
      // Does this user have a profile?
      if(!user){
        return message.reply(`This user has not started their DiscordLove profile`);
      }

      let premium_duration = 1;
      if(args[1]){
        if(args[1] == 'life'){
            let sqlLife = `UPDATE users SET premium_status = 2 WHERE user_discord = ${target.id}`;
            client.db.run(sqlLife, [], (err) => {
              if(err) return console.error(err.message);
              message.reply(`${target} has been granted LIFETIME Premium Membership`);
            });
        } else {
          premium_duration = parseInt(args[1]);
          let sql = `UPDATE users SET premium_status = 1, premium_time = ${parseInt(now) + parseInt(premium_duration * 1000 * 60 * 60 * 24)} WHERE user_discord = ${target.id}`;
          client.db.run(sql, [], (err) => {
            if(err) return console.error(err.message);
            message.reply(`${target} has been upgraded to premium for the next ${premium_duration} day ${premium_duration > 1 ? 's' : ''}`);
          });
        }
      } else {
        let sql = `UPDATE users SET premium_status = 1, premium_time = ${parseInt(now) + parseInt(premium_duration * 1000 * 60 * 60 * 24)} WHERE user_discord = ${target.id}`;
        client.db.run(sql, [], (err) => {
          if(err) return console.error(err.message);
          message.reply(`${target} has been upgraded to premium for the next ${premium_duration} day ${premium_duration > 1 ? 's' : ''}`);
        });
      }
    });
  });
};

exports.conf = {
  aliases: [],
  permLevel: 4
};

exports.help = {
  name: "givepremium",
  description: "Gives an account premium status",
  usage: "givepremium <@user>"
}
