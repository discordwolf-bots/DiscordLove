const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);

const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./utils/users.db', sqlite3.OPEN_READWRITE, (err) => {
  if(err){
    console.error(err.message);
  }
  console.log(`Connected to DB - Buy`);
});

exports.run = function(client, message, args){
  let now = moment().format('DDMMYYhhmmss');
  let sql1 = `SELECT * FROM users WHERE id = ${message.author.id}`;
  db.get(sql1, (err, row) => {
    if(err) return console.error(err.message);
    if(!row) return message.reply(`You need a profile first`);
    let sql2 = `SELECT * FROM users WHERE cost <= ${row.money} AND owner != ${row.id} AND id != ${row.id} ORDER BY cost DESC LIMIT 10`;
    db.all(sql2, (err, rows) => {
      if(err) return console.error(err.message);
      let affordable_users = [];
      rows.forEach((user_info) => {
        if(now - parseInt(user_info.lastpurchase) < 300){
          let rowUser = message.guild.members.get(user_info.id);
          if(rowUser){
            if(rowUser.nickname != null){
              affordable_users.push(`**${rowUser.nickname}** - **\$${user_info.cost}** <:cooldown:505752316649930774>`);
            } else {
              affordable_users.push(`**${rowUser.user.username}** - **\$${user_info.cost}** <:cooldown:505752316649930774>`);
            }
          }
          if(!rowUser) affordable_users.push(`<${user_info.id}> - **\$${user_info.cost} <:cooldown:505752316649930774>`);
        } else {
          // Purchasable
          let rowUser = message.guild.members.get(user_info.id);
          if(rowUser){
            if(rowUser.nickname != null){
              affordable_users.push(`**${rowUser.nickname}** - **\$${user_info.cost}**`);
            } else {
              affordable_users.push(`**${rowUser.user.username}** - **\$${user_info.cost}**`);
            }
          }
          if(!rowUser) affordable_users.push(`<${user_info.id}> - **\$${user_info.cost}`);
        }
      });
      let embed = new Discord.RichEmbed()
        .setColor('#fa1201')
        .addField(`Top 10 Users you can afford`, `${affordable_users.join('\n')}`);
      message.channel.send(embed);
    });
  });
};

exports.conf = {
  aliases: ['icanbuy'],
  permLevel: 0
};

exports.help = {
  name: "affordable",
  description: "Displays the users you can currently afford",
  usage: "affordable"
}
