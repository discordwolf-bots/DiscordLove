const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);

exports.run = function(client, message, args){

  client.guild_info(message.guild.id, '', (guild) => {
    client.user_info(message.author.id, '', (user) => {

      let check_channel = true;
      if(user.user_discord == config.botowner) check_channel = false;
      if(message.channel.name != 'discord-love-setup' && check_channel){
        message.delete();
        return message.channel.send(`Please do the command **${config.prefix}start** in <#${guild.channel_setup}> first!`);
      }

      let discord_love_role = message.guild.roles.find(role => role.name === "DiscordLoved");
      if(!discord_love_role) return message.channel.send(`Please create the role \`\`DiscordLoved\`\``)
      if(!guild) return message.reply(`Please re-invite the bot to this server!`);
      if(!user){
        // New user being added
        let sqlInsert = `INSERT INTO users (user_discord) VALUES (${message.author.id})`;
        client.db.run(sqlInsert, [], (err) => {
          if(err) return console.error(err.message);
          let now = moment().format('x');
          let sqlUpdateTS = `UPDATE users SET user_start_ts=${now}, ts_message=${now} WHERE user_discord=${message.author.id}`;
          client.db.run(sqlUpdateTS, [], (err) => {
            if(err) return console.error(err.message);
            //message.member.setNickname(`[0] ${message.author.username}`);
          })
        });
      } else {
        //message.member.setNickname(`[${user.user_level}] ${message.author.username}`);
      }
      // Gives the member the DiscordLoved role
      message.member.addRole(discord_love_role.id);
      message.channel.send(`${message.author} has joined the party!`)

    });
  });
};

exports.conf = {
  aliases: [],
  permLevel: 0
};

exports.help = {
  name: "start",
  description: "Starts your DiscordLove journey",
  usage: "start"
}
