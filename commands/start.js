const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);

exports.run = function(client, message, args, user, guild){

  if(!guild) return message.reply(`Please tell an admin to re-invite the bot to the server.`)

  let check_channel = true;
  if(message.author.id == config.botowner) check_channel = false;
  if(guild.channel_setup != message.channel.id && check_channel){
    message.delete();
    return message.channel.send(`Please do the command **${config.prefix}start** in <#${guild.channel_setup}> first!`).then(msg => msg.delete(5000));
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

  let embed_colour = '#' + Math.floor(Math.random()*16777215).toString(16);
  let embed = new Discord.RichEmbed()
    .setColor(embed_colour)
    .setAuthor(`${message.member.displayName} has joined the party!`, message.author.avatarURL)
    .setTimestamp();
    console.log(guild);
  client.channels.get(guild.channel_main).send(embed);

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
