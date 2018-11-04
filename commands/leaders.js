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
  let now = moment().format('x');
  let sql = `SELECT * FROM users ORDER BY cost DESC LIMIT 10`;
  db.all(sql, [], (err, rows) => {
    if(err) return console.error(err.message);
    let leader_count = 0;
    let leader_value = 0;
    let leader_names = [];
    if(!rows) return message.reply(`You dont own anybody yet!`);
    rows.forEach((row) => {
      leader_count++;
      leader_value += row.cost-100;
      let rank_emoji = `<:heart_red:505752941932838912>`;
      if(leader_count == 1) rank_emoji = `<:heart_diamond:505750302863917056>`;
      if(leader_count == 2) rank_emoji = `<:heart_platinum:505750302796939283>`;
      if(leader_count == 3) rank_emoji = `<:heart_gold:505750302226645003>`;
      if(leader_count == 4) rank_emoji = `<:heart_silver:505750301341515779>`;
      if(leader_count == 5) rank_emoji = `<:heart_bronze:505750301614276618>`;
      if(now - parseInt(row.lastpurchase) < 300 * 1000){
        let rowUser = message.guild.members.get(row.id);
        if(rowUser){
          if(rowUser.nickname != null){
            leader_names.push(`${rank_emoji} **${leader_count}.** **${rowUser.nickname}** - **\$${(row.cost-100).format(0)}** <:cooldown:505752316649930774>`);
          } else {
            leader_names.push(`${rank_emoji} **${leader_count}.** **${rowUser.user.username}** - **\$${(row.cost-100).format(0)}** <:cooldown:505752316649930774>`);
          }
        }
        if(!rowUser) leader_names.push(`${rank_emoji} **${leader_count}.** <${row.id}> - **\$${(row.cost).format(0)}** <:cooldown:505752316649930774>`);
      } else {
        // Purchasable
        let rowUser = message.guild.members.get(row.id);
        if(rowUser){
          if(rowUser.nickname != null){
            leader_names.push(`${rank_emoji} **${leader_count}.** **${rowUser.nickname}** - **\$${(row.cost-100).format(0)}**`);
          } else {
            leader_names.push(`${rank_emoji} **${leader_count}.** **${rowUser.user.username}** - **\$${(row.cost-100).format(0)}**`);
          }
        }
        if(!rowUser) leader_names.push(`${rank_emoji} **${leader_count}.** <${row.id}> - **\$${row.cost}**`);
      }

    });
    if(leader_count == 0) return message.reply(`You dont own anybody!`);
    if(leader_count <= 20){
      let embed = new Discord.RichEmbed()
        .setColor(`#DA5220`)
        .setTitle(`Most expensive users!`)
        .addField(`Top ${leader_count} Users`, `${leader_names.join(`\n`)}`);
      message.channel.send(embed);
    }
  });
};

exports.conf = {
  aliases: [],
  permLevel: 0
};

exports.help = {
  name: "leaders",
  description: "Display the top 10 most expensive",
  usage: "leaders"
}
