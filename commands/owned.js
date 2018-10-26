const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);

const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./utils/users.db', sqlite3.OPEN_READWRITE, (err) => {
  if(err){
    console.error(err.message);
  }
  console.log(`Connected to DB - Profile`);
});


Number.prototype.format = function(n, x) {
  var re = '(\\d)(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
  return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$1,');
};

exports.run = function(client, message, args){

  let sqlCheck = `SELECT * FROM users WHERE id = ${message.author.id}`;
  db.get(sqlCheck, [], (err,row) => {
    if(err) return console.error(err.message);
    if(!row) return message.channel.send(`Please do the command **${config.prefix}start** in #discord-love-setup first!`);
    if(message.channel.id != '505133836280266752') { message.delete(); return message.channel.send(`Please only use DiscordLove commands in ${message.guild.channels.get('505133836280266752').toString()}`); }

    let sqlCheckOwner = `SELECT * FROM users WHERE owner = ${message.author.id} ORDER BY cost DESC, userID ASC`;
    db.all(sqlCheckOwner, [], (err, rows) => {
      let own_count = 0;
      let own_value = 0;
      let own_names = [];
      rows.forEach((row) => {
        own_count++;
        own_value += row.cost-100;
        let rowUser = message.guild.members.get(row.id);
        if(rowUser){
          if(rowUser.nickname != null){
            own_names.push(`**${own_count}.** **${rowUser.nickname}** (${rowUser.user.username}#${rowUser.user.discriminator}) - **\$${row.cost-100}**`);
          } else {
            own_names.push(`**${own_count}.** **${rowUser.user.username}** (${rowUser.user.username}#${rowUser.user.discriminator}) - **\$${row.cost-100}**`);
          }
        }
        if(!rowUser) own_names.push(`**${own_count}.** <${row.id}> - **\$${row.cost}`);
      });
      if(own_count <= 20){
        let embed = new Discord.RichEmbed()
          .setColor(`#DA5220`)
          .setTitle(`People ${message.author.username}#${message.author.discriminator} owns`)
          .setThumbnail(`${message.author.avatarURL}`)
          .addField(`Total Value: **\$${own_value.format(0)}**`, `${own_names.join(`\n`)}`)
          .setFooter(`Showing 1-${own_count} of ${own_count}`);
        message.channel.send(embed);
      }
    });
  });

  let embed = new Discord.RichEmbed()
    .setColor(`#6D0A0A`)
    .setAuthor(`${message.author.username} used command 'profile'`, message.author.avatarURL)
    .setFooter(`Command Used`)
    .setTimestamp();
  //client.channels.get(config.commands).send({embed});
};

exports.conf = {
  aliases: [],
  permLevel: 0
};

exports.help = {
  name: "owned",
  description: "Displays who you own",
  usage: "owned"
}
