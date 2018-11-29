const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);

exports.run = function(client, message, args){
  client.guild_info(message.guild.id, '', (guild) => {
    client.user_info(message.author.id, '', (user) => {
      if(!guild) return message.reply(`Please re-invite the bot`);
      if(!user) return message.reply(`Please start your account`);
      if(user.premium_status == 0) return message.reply(`This is a **Premium Only** Command`);
      if(!args[0]) return message.reply(`Please state a colour hex-code (do not include the #)`);
      if(args[0].includes('#')) return message.reply(`Please state a colour hex-code (do not include the #)`);

      if(args[0].includes('rand')){
        let sql = `UPDATE users SET user_colour = 'RAND' WHERE user_discord = ${message.author.id}`;
        client.db.run(sql, [], (err) => {
          if(err) return console.error(err.message);
          let embed = new Discord.RichEmbed()
            .setColor('#' + Math.floor(Math.random()*16777215).toString(16))
            .setAuthor(`New colour set for ${message.author.username}#${message.author.discriminator}`, message.author.avatarURL)
            .setTimestamp();
          message.delete();
          return message.channel.send(embed);
        });
      } else {
        if(args[0].length > 6) return message.reply(`Please state a colour hex-code (do not include the #)`);
        let sql = `UPDATE users SET user_colour = '${args[0]}' WHERE user_discord = ${message.author.id}`;
        client.db.run(sql, [], (err) => {
          if(err) return console.error(err.message);
          let embed = new Discord.RichEmbed()
            .setColor(`#${args[0]}`)
            .setAuthor(`New colour set for ${message.author.username}#${message.author.discriminator}`, message.author.avatarURL)
            .setTimestamp();
          message.delete();
          message.channel.send(embed);
        });
      }
    });
  });
};

exports.conf = {
  aliases: ['color'],
  permLevel: 0
};

exports.help = {
  name: "colour",
  description: "Sets your custome colour",
  usage: "colour <#hex>"
}
