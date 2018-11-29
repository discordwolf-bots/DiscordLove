const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);

exports.run = function(client, message, args){
  message.delete();
  client.guild_info(message.guild.id, '', (guild) => {
    client.user_info(message.author.id, '', (user) => {

      if(message.channel.name != 'discord-love-setup')
        return message.channel.send(`Please do the command **${config.prefix}start** in **discord-love-setup** first!`);
      let discord_love_role = message.guild.roles.find(role => role.name === "DiscordLoved");
      if(!discord_love_role)
        return message.channel.send(`Please create the role \`\`DiscordLoved\`\``);

      if(!guild){
        // Bot has not been added to the guild database, need a new function for this
        return message.reply(`Please re-invite the bot to this server!`);
      }
      if(!user){
        // New user being added
        let sqlInsert = `INSERT INTO users (user_discord) VALUES (${message.author.id})`;
        client.db.run(sqlInsert, [], (err) => {
          if(err) return console.error(err.message);
          let now = moment().format('x');
          let sqlUpdateTS = `UPDATE users SET ts_message=${now} WHERE user_discord=${message.author.id}`;
          client.db.run(sqlUpdateTS, [], (err) => {
            if(err) return console.error(err.message);
          })
        });
      }
      // Gives the member the DiscordLoved role
      message.member.addRole(discord_love_role.id);
    });
  });
};

exports.conf = {
  aliases: [],
  permLevel: 4
};

exports.help = {
  name: "start",
  description: "Starts your DiscordLove journey",
  usage: "start"
}
