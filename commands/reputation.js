const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);

exports.run = async function(client, message, args, user, guild){

  if(!user) return message.reply(`Please start your profile in <#${guild.channel_setup}>`)
  if(!guild) return message.reply(`Please tell an admin to re-invite the bot to the server.`)

  let check_channel = true;
  if(user.user_discord == config.botowner) check_channel = false;
  if(guild.channel_main != message.channel.id && check_channel){
    message.delete();
    return message.reply(`Please only use this command in <#${guild.channel_main}>`)
  }

  let mentioned = message.mentions.users.first();
  if(!guild) return message.reply(`Please re-invite the bot`);
  if(!user) return message.reply(`Please start your account`);
  if(!mentioned) return message.reply(`Please mention a user to give reputation to`);
  if(user.reputation_given_today == 1 && user.premium_status == 0) return message.reply(`You can give no more reputation today!`);
  if(user.reputation_given_today == 2 && user.premium_status > 0) return message.reply(`You can give no more reputation today!`);
  if(mentioned == message.author) return message.reply(`You cannot give reputation to yourself`);

  let now = moment().format('x');
  let target_mentioned = message.guild.members.get(mentioned.id);

  if(now - user.ts_reputation > (1000 * 60 * 60 * 24)){
    // It has been over 24 hours since last reputation given
    client.user_info(mentioned.id, '', (target) => {
      if(!target) return message.reply(`This person hasn't started their profile!`);
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
            .setAuthor(`${message.member.displayName} has given ${target_mentioned.displayName} a reputation point!`, message.author.avatarURL)
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
              .setAuthor(`${message.member.displayName} has given ${target_mentioned.displayName} a reputation point!`, message.author.avatarURL)
              .setTimestamp();
            message.channel.send(embed);
          });
        });
      })
    }
  }

  if(now - user.ts_commands > 60 * 1000){
    let sql_update_command_counter = `UPDATE users SET counter_commands = ${user.counter_commands+1}, ts_commands = ${now} WHERE user_discord = ${user.user_discord}`;
    client.db.run(sql_update_command_counter, (err) => {
      if(err) return console.error(`reputation.js sql_update_command_counter ${err.message}`);
    })
  }

};

exports.conf = {
  aliases: ['rep'],
  permLevel: 0
};

exports.help = {
  name: "reputation",
  description: "Give another user some reputation",
  usage: "reputation <@user>"
}
