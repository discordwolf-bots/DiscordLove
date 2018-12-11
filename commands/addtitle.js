const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);

exports.run = function(client, message, args, user, guild){
  if(!user) return message.reply(`Please start your profile in <#${guild.channel_setup}>`)
  if(!guild) return message.reply(`Please tell an admin to re-invite the bot to the server.`)

  let sql_add_title = ``;
  if(!args[0]){
    return message.reply(`Please use the correct format **${config.prefix}addtitle <title name> <(?) buyable (0/1)> <(?) cost>`);
  }
  if(!args[1]){ // Only the title name - Default not buyable, no cost
    sql_add_title = `INSERT INTO titles (title_text) VALUES ('${args[0]}')`;
  } else if(!args[2]){ //
    return message.reply(`Please use the correct format **${config.prefix}addtitle <title name> <(?) buyable (0/1)> <(?) cost>`);
  } else if(!args[3]){
    sql_add_title = `INSERT INTO titles (title_text, title_buyable, title_cost) VALUES ('${args[0]}', ${parseInt(args[1])}, ${parseInt(args[2])})`;
  } else {
    return message.reply(`Please use the correct format **${config.prefix}addtitle <title name> <(?) buyable (0/1)> <(?) cost>`);
  }

  message.channel.send(sql_add_title);

  client.db.run(sql_add_title, (err) => {
    if(err) return console.error(`addtitle.js sql_add_title ${err.message}`);
  });

};

exports.conf = {
  aliases: [],
  permLevel: 4
};

exports.help = {
  name: "addtitle",
  description: "Adds a new title",
  usage: "addtitle <options>"
}
