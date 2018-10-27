const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);

const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./utils/users.db', sqlite3.OPEN_READWRITE, (err) => {
  if(err){
    console.error(err.message);
  }
  console.log(`Connected to DB - Build`);
});

exports.run = function(client, message, args){

  let sql = `SELECT * FROM users WHERE id = ${message.author.id}`;
  db.get(sql, (err, row) => {
    if(err) return console.error(err.message);
    if(!row) return message.reply(`You need to create a profile first!`);
    let user_value_progress = row.achieve_your_value;
    let owned_value_progress = row.achieve_owned_value;
    let hidden_buyabot_progress = row.achieve_buy_the_bot;

    let achievements_text = [];
    let user_value_icon, owned_value_icon, buyabot_icon = `:question`;

    if(hidden_buyabot_progress == 0) achievements_text.push(`${buyabot_icon} **Hidden Achievement**`);

    if(user_value_progress > 0) user_value_icon = `:bust_in_silhouette:`;
    if(owned_value_progress > 0) owned_value_icon = `:busts_in_silhouette:`;

    achievements_text.push(`${user_value_icon} **Self-Worth** - Level **${user_value_progress}**`);
    achievements_text.push(`${owned_value_icon} **Expensive Taste** - Level **${owned_value_progress}**`);
    if(hidden_buyabot_progress > 0) {
      buyabot_icon = `:robot:`;
      achievements_text.push(`${buyabot_icon} **Hidden Achievement** - Level **Max**`);
    }

    let embed = new Discord.RichEmbed()
      .setColor(`#FF7293`)
      .setTitle(`Achievements progress ${message.author.username}#${message.author.discriminator}`)
      .addField(`Achievements`, `${achievements_text.join(`\n`)}`)
      .setFooter(`More achievements coming soon!`);
    message.channel.send(embed);
  });

  let embed = new Discord.RichEmbed()
    .setColor(`#6D0A0A`)
    .setAuthor(`${message.author.username} used command 'ping'`, message.author.avatarURL)
    .setFooter(`Command Used`)
    .setTimestamp();
  //client.channels.get(config.commands).send({embed});
};

exports.conf = {
  aliases: ['ach'],
  permLevel: 4
};

exports.help = {
  name: "achievements",
  description: "Displays your achievements",
  usage: "achievements"
}
