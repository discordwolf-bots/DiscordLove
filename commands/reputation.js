const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);

exports.run = async function(client, message, args){

  client.guild_info(message.guild.id, '', (guild) => {
    client.user_info(message.author.id, '', (user) => {
      let mentioned = message.mentions.users.first();
      if(!guild) return message.reply(`Please re-invite the bot`);
      if(!user) return message.reply(`Please start your account`);
      if(!mentioned) return message.reply(`Please mention a user to give reputation to`);
      if(user.reputation_given_today == 1 && user.premium_status == 0) return message.reply(`You can give no more reputation today!`);
      if(user.reputation_given_today == 2 && user.premium_status > 0) return message.reply(`You can give no more reputation today!`);

      let now = moment().format('x');

      if(now - user.ts_reputation > (1000 * 60 * 60 * 24)){
        // It has been over 24 hours since last reputation given
        client.user_info(mentioned.id, '', (target) => {
          let sql_user = `UPDATE users SET reputation_given=${user.reputation_given+1}, reputation_given_today=${user.reputation_given_today+1}, ts_reputation=${now} WHERE user_discord=${message.author.id}`;
          let sql_target = `UPDATE users SET reputation_total=${target.reputation_total+1} WHERE user_discord=${target.user_discord}`;
          client.db.run(sql_user, [], (err) => {
            if(err) return console.error(err.message);
            client.db.run(sql_target, [], (err) => {
              if(err) return console.error(err.message);

              let embed_colour = '#' + user.user_colour;
              if(user.user_colour == 'RAND') embed_colour = '#' + Math.floor(Math.random()*16777215).toString(16);
              let embed = new Discord.RichEmbed()
                .setColor(embed_colour)
                .setAuthor(`${message.member.displayName} has given ${target.displayName} a reputation point!`, message.author.avatarURL)
                .setTimestamp();
              message.channel.send(embed);
            });
          });
        })


      } else {
        // It has been under 24 hours since last reputation given (check if premium)
        if(user.premium_status > 0 && user.reputation_given_today < 2){
          client.user_info(mentioned.id, '', (target) => {
            let sql_user = `UPDATE users SET reputation_given=${user.reputation_given+1}, reputation_given_today=${user.reputation_given_today+1}, ts_reputation=${now} WHERE user_discord=${message.author.id}`;
            let sql_target = `UPDATE users SET reputation_total=${target.reputation_total+1} WHERE user_discord=${target.user_discord}`;
            client.db.run(sql_user, [], (err) => {
              if(err) return console.error(err.message);
              client.db.run(sql_target, [], (err) => {
                if(err) return console.error(err.message);

                let embed_colour = '#' + user.user_colour;
                if(user.user_colour == 'RAND') embed_colour = '#' + Math.floor(Math.random()*16777215).toString(16);
                let embed = new Discord.RichEmbed()
                  .setColor(embed_colour)
                  .setAuthor(`${message.author.username}#${message.author.discriminator} has given ${mentioned.username}#${mentioned.discriminator} a reputation point!`, message.author.avatarURL)
                  .setTimestamp();
                message.channel.send(embed);
              });
            });
          })
        }
      }

    });
  });

};

exports.conf = {
  aliases: ['rep'],
  permLevel: 4
};

exports.help = {
  name: "reputation",
  description: "Give another user some reputation",
  usage: "reputation <@user>"
}
