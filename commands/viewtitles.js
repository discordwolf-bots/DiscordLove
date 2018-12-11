const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);

exports.run = function(client, message, args, user, guild){
  if(!user) return message.reply(`Please start your profile in <#${guild.channel_setup}>`)
  if(!guild) return message.reply(`Please tell an admin to re-invite the bot to the server.`)

  let sql_select = `SELECT * FROM titles`;
  client.db.all(sql_select, (err, rows) => {
    if(err) return console.error(`viewtitles.js sql_select ${err.message}`);
    let title_array = [];
    rows.forEach(row => {
      title_array.push(`**#${row.title_id}** : ${row.title_text}`);
    });
    message.channel.send(title_array.join('\n'));
  });

};

exports.conf = {
  aliases: [],
  permLevel: 4
};

exports.help = {
  name: "viewtitles",
  description: "View All Title",
  usage: "viewtitles"
}
