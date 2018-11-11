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

Number.prototype.format = function(n, x) {
  var re = '(\\d)(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
  return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$1,');
};

exports.run = async function(client, message, args){

  let sql = `SELECT * FROM users WHERE id = ${message.author.id}`;
  db.get(sql, async (err, row) => {
    if(err) return console.error(err.message);
    if(!row) return message.reply(`You need to create a profile first!`);

    let user_value_progress = row.achieve_your_value;
    let owned_value_progress = row.achieve_owned_value;
    let talks_a_lot_progress = row.achieve_talks_a_lot;
    let chats_a_lot_progress = row.achieve_chats_a_lot;
    let hidden_buyabot_progress = row.achieve_buy_the_bot;
    let fishing_caught_progress = row.achieve_go_fishing;
    let fishing_sold_progress = row.achieve_fishmonger;
    let hidden_magikarp_progress = row.achieve_catch_a_karp;

    let fish_caught = row.goneFishing;
    let fish_sold = row.soldFish;
    let magikarpCaught = row.magikarpCaught;

    let user_value_thresholds = config.thresh_self_worth;
    let owned_value_thresholds = config.thresh_expensive_taste;
    let talks_a_lot_thresholds = config.thresh_talks_a_lot;
    let chats_a_lot_thresholds = config.thresh_chats_a_lot;
    let gone_fishing_thresholds = config.thresh_catch_a_fish;
    let sold_fish_thresholds = config.thresh_sell_a_fish;

    let uv_t = user_value_thresholds.split(',');
    let ov_t = owned_value_thresholds.split(',');
    let tal_t = talks_a_lot_thresholds.split(',');
    let cha_t = chats_a_lot_thresholds.split(',');
    let cat_t = gone_fishing_thresholds.split(',');
    let sol_t = sold_fish_thresholds.split(',');

    let achievements_text = [];
    let user_value_icon = `:question:`;
    let owned_value_icon = `:question:`;
    let talks_a_lot_icon = `:question:`;
    let chats_a_lot_icon = `:question:`;
    let buyabot_icon = `:question:`;
    let fishing_caught_icon = `:question:`;
    let fishing_sold_icon = `:question:`;
    let magikarp_icon = `:question:`;

    if(user_value_progress > 0) user_value_icon = `:bust_in_silhouette:`;
    if(owned_value_progress > 0) owned_value_icon = `:busts_in_silhouette:`;
    if(talks_a_lot_progress > 0) talks_a_lot_icon = `:speaking_head:`;
    if(chats_a_lot_progress > 0) chats_a_lot_icon = `:speaker:`;
    if(fishing_caught_progress > 0) fishing_caught_icon = `:fish:`;
    if(fishing_sold_progress > 0) fishing_sold_icon = `:fishing_pole_and_fish:`;


    if(user_value_progress < config.thresh_self_worth.split(',').length){
      await achievements_text.push(`${user_value_icon} **Self-Worth** - Level **${user_value_progress} / ${config.thresh_self_worth.split(',').length}** \n*Get your value to \$${parseInt(uv_t[user_value_progress]).format(0)} or higher for level ${user_value_progress+1}*`);
    } else {
      await achievements_text.push(`${user_value_icon} **Self-Worth** - Level **Maxed**`);
    }

    if(owned_value_progress < config.thresh_expensive_taste.split(',').length){
      await achievements_text.push(`${owned_value_icon} **Expensive Taste** - Level **${owned_value_progress} / ${config.thresh_expensive_taste.split(',').length}** \n*Buy somebody worth \$${parseInt(ov_t[owned_value_progress]).format(0)} or higher for level ${owned_value_progress+1}*`);
    } else {
      await achievements_text.push(`${owned_value_icon} **Expensive Taste** - Level **Maxed**`);
    }

    if(talks_a_lot_progress < config.thresh_talks_a_lot.split(',').length){
      await achievements_text.push(`${talks_a_lot_icon} **Talks a Lot** - Level **${talks_a_lot_progress} / ${config.thresh_talks_a_lot.split(',').length}** \n*Progress ${(row.messagesSent).format(0)} / ${parseInt(tal_t[talks_a_lot_progress]).format(0)} (send messages that earn you money)*`);
    } else {
      await achievements_text.push(`${talks_a_lot_icon} **Talks a Lot** - Level **Maxed**`);
    }

    if(chats_a_lot_progress < config.thresh_chats_a_lot.split(',').length){
      await achievements_text.push(`${chats_a_lot_icon} **Chats a Lot** - Level **${chats_a_lot_progress} / ${config.thresh_chats_a_lot.split(',').length}** \n*Be in a Voice Chat for a total of ${parseInt(cha_t[chats_a_lot_progress]).format(0)} minutes for level ${chats_a_lot_progress+1}*`);
    } else {
      await achievements_text.push(`${chats_a_lot_icon} **Chats a Lot** - Level **Maxed**`);
    }

    if(fishing_caught_progress < config.thresh_catch_a_fish.split(',').length){
      await achievements_text.push(`${fishing_caught_icon} **Gone Fishing** - Level **${fishing_caught_progress} / ${config.thresh_catch_a_fish.split(',').length}** \n*Progress ${(row.goneFishing).format(0)} / ${parseInt(cat_t[gone_fishing_progress]).format(0)} (successfully catch fish)*`);
    } else {
      await achievements_text.push(`${fishing_caught_icon} **Gone Fishing** - Level **Maxed**`);
    }

    if(fishing_sold_progress < config.thresh_sell_a_fish.split(',').length){
      await achievements_text.push(`${fishing_sold_icon} **Fishmonger** - Level **${fishing_sold_progress} / ${config.thresh_sell_a_fish.split(',').length}** \n*Progress ${(row.soldFish).format(0)} / ${parseInt(sol_t[fishing_sold_progress]).format(0)} (sell fish)*`);
    } else {
      await achievements_text.push(`${fishing_sold_icon} **Fishmonger** - Level **Maxed**`);
    }


    if(hidden_buyabot_progress == 0) achievements_text.push(`${buyabot_icon} **Hidden Achievement**`);
    if(hidden_buyabot_progress > 0) {
      buyabot_icon = `:robot:`;
      achievements_text.push(`${buyabot_icon} **Hidden Achievement** - Level **Maxed**`);
    }

    if(hidden_magikarp_progress == 0) achievements_text.push(`${magikarp_icon} **Hidden Achievement**`);
    if(hidden_magikarp_progress > 0) {
      magikarp_icon = `<:magikarp:507005931503222784>`;
      achievements_text.push(`${magikarp_icon} **Hidden Achievement** - Level **Maxed**`);
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
  permLevel: 0
};

exports.help = {
  name: "achievements",
  description: "Displays your achievements",
  usage: "achievements"
}
