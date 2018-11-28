const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);

exports.run = function(client, message, args){

  let sql = `CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY ASC,
    user_discord TEXT,
    user_level INTEGER DEFAULT 0,
    user_experience INTEGER DEFAULT 0,
    user_money REAL DEFAULT 0.00,
    user_cps REAL DEFAULT 0.10,

    buy_cost INTEGER DEFAULT 100,
    buy_owner TEXT DEFAULT 0,

    reputation_total INTEGER DEFAULT 0,
    reputation_given INTEGER DEFAULT 0,
    reputation_given_today INTEGER DEFAULT 0,

    premium_status INTEGER DEFAULT 0,
    premium_time TEXT DEFAULT 0,

    ts_profile TEXT DEFAULT 0,
    ts_reputation TEXT DEFAULT 0,
    ts_fish TEXT DEFAULT 0,
    ts_message TEXT DEFAULT 0,
    ts_commands TEXT DEFAULT 0,

    counter_messages INTEGER DEFAULT 0,
    counter_commands INTEGER DEFAULT 0,
    counter_fishing INTEGER DEFAULT 0,
    counter_fish_caught INTEGER DEFAULT 0,
    counter_money_spent INTEGER DEFAULT 0,

    list_fish_inventory TEXT DEFAULT '0,0,0,0,0,0',
    list_fish_inventory_history TEXT DEFAULT '0,0,0,0,0,0',

    ach_premium INTEGER DEFAULT 0,
    ach_total_spent INTEGER DEFAULT 0,
    ach_commands_used INTEGER DEFAULT 0,
    ach_spammer INTEGER DEFAULT 0,
    ach_speading_love INTEGER DEFAULT 0,
    ach_social INTEGER DEFAULT 0,
    ach_fisher INTEGER DEFAULT 0

  )`;
  client.db.run(sql, (err) => {
    if(err) return console.error(err.message);
    message.channel.send(`New table created - users`);
    console.log(`Table created`);
  });

  let embed = new Discord.RichEmbed()
    .setColor(`#6D0A0A`)
    .setAuthor(`${message.author.username} used command 'ping'`, message.author.avatarURL)
    .setFooter(`Command Used`)
    .setTimestamp();
  //client.channels.get(config.commands).send({embed});
};

exports.conf = {
  aliases: ['2'],
  permLevel: 4
};

exports.help = {
  name: "build",
  description: "Builds Database",
  usage: "build"
}
