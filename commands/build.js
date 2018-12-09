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
    user_money_history REAL DEFAULT 0.00,
    user_cps REAL DEFAULT 0.10,
    user_colour TEXT DEFAULT 'RAND',
    user_start_ts TEXT DEFAULT 0,
    user_premium_coins INTEGER DEFAULT 0,
    user_diamonds INTEGER DEFAULT 0,
    user_amount_donated REAL DEFAULT 0.00,
    user_title TEXT,

    prestige_level INTEGER DEFAULT 0,

    experience_fishing INTEGER DEFAULT 0,
    experience_fishing_level INTEGER DEFAULT 0,
    experience_woodcutting INTEGER DEFAULT 0,
    experience_woodcutting_level INTEGER DEFAULT 0,
    experience_mining INTEGER DEFAULT 0,
    experience_mining_level INTEGER DEFAULT 0,

    gathering_fish INTEGER DEFAULT 0,
    gathering_logs INTEGER DEFAULT 0,
    gathering_ore INTEGER DEFAULT 0,

    reputation_total INTEGER DEFAULT 0,
    reputation_given INTEGER DEFAULT 0,
    reputation_given_today INTEGER DEFAULT 0,

    premium_status INTEGER DEFAULT 0,
    premium_time TEXT DEFAULT 0,

    ts_profile TEXT DEFAULT 0,
    ts_reputation TEXT DEFAULT 0,
    ts_fish TEXT DEFAULT 0,
    ts_mine TEXT DEFAULT 0,
    ts_chop TEXT DEFAULT 0,
    ts_message TEXT DEFAULT 0,
    ts_commands TEXT DEFAULT 0,
    ts_crate_daily TEXT DEFAULT 0,
    ts_crate_premium TEXT DEFAULT 0,

    counter_messages INTEGER DEFAULT 0,
    counter_commands INTEGER DEFAULT 0,
    counter_fishing INTEGER DEFAULT 0,
    counter_fish_caught INTEGER DEFAULT 0,
    counter_woodcutting INTEGER DEFAULT 0,
    counter_woodcutting_chop INTEGER DEFAULT 0,
    counter_mining INTEGER DEFAULT 0,
    counter_mining_ore INTEGER DEFAULT 0,
    counter_money_spent REAL DEFAULT 0,
    counter_crates_opened INTEGER DEFAULT 0,

    list_fish_inventory TEXT DEFAULT '0,0,0,0,0,0',
    list_fish_inventory_history TEXT DEFAULT '0,0,0,0,0,0',
    list_logs_inventory TEXT DEFAULT '0,0,0,0,0,0',
    list_logs_inventory_history TEXT DEFAULT '0,0,0,0,0,0',
    list_ore_inventory TEXT DEFAULT '0,0,0,0,0,0',
    list_ore_inventory_history TEXT DEFAULT '0,0,0,0,0,0',
    list_user_inventory TEXT,

    crate_daily INTEGER DEFAULT 1,
    crate_premium INTEGER DEFAULT 0,
    crate_rare INTEGER DEFAULT 0,

    ach_premium INTEGER DEFAULT 0,
    ach_total_spent INTEGER DEFAULT 0,
    ach_commands_used INTEGER DEFAULT 0,
    ach_spammer INTEGER DEFAULT 0,
    ach_speading_love INTEGER DEFAULT 0,
    ach_social INTEGER DEFAULT 0,
    ach_fisher INTEGER DEFAULT 0,
    ach_woodcutter INTEGER DEFAULT 0,
    ach_miner INTEGER DEFAULT 0,
    ach_crate_opener INTEGER DEFAULT 0,
    ach_prestige INTEGER DEFAULT 0

  )`;
  client.db.run(sql, (err) => {
    if(err) return console.error(err.message);
    message.channel.send(`Table \`users\` has been created`)
    console.log(`Table created`);
  });
};

exports.conf = {
  aliases: ['b1'],
  permLevel: 4
};

exports.help = {
  name: "build",
  description: "Builds Database",
  usage: "build"
}
