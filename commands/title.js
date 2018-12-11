const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);

exports.run = function(client, message, args, user, guild){
  if(!user) return message.reply(`Please start your profile in <#${guild.channel_setup}>`)
  if(!guild) return message.reply(`Please tell an admin to re-invite the bot to the server.`)

  let users_titles = user.user_titles.split(',');
  let valid_title = false;

  let sql_update_current_title = ``;

  if(args[0] == 0 || args[0].toLowerCase() == 'reset'){
    valid_title = true;
    sql_update_current_title = `UPDATE users SET user_current_title = 0 WHERE user_discord = ${user.user_discord}`;
  }

  for(let i=0; i<users_titles.length; i++){
    if(parseInt(users_titles[i]) == parseInt(args[0])){
      valid_title = true;
    }
  }

  if(valid_title){
    sql_update_current_title = `UPDATE users SET user_current_title = ${parseInt(args[0])} WHERE user_discord = ${user.user_discord}`;
  } else {
    return;
  }

  client.db.run(sql_update_current_title, (err) => {
    if(err) return console.error(`title.js sql_update_current_title ${err.message}`);
    client.title_info(parseInt(args[0]), '', (title) => {
      message.reply(`Your title has now been set to **${title.title_text}**`);
    })
  });

};

exports.conf = {
  aliases: [],
  permLevel: 0
};

exports.help = {
  name: "title",
  description: "Title Commands",
  usage: "title"
}
