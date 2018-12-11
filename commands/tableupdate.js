const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);

exports.run = function(client, message, args){
  let sql_step_1 = `ALTER TABLE users RENAME TO users_old`;
  let sql_step_2 = `CREATE TABLE IF NOT EXISTS users (
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
    user_titles TEXT DEFAULT '',
    user_current_title INTEGER DEFAULT 0,

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
  let sql_step_3 = `INSERT INTO users
    (
      user_id,user_discord,user_level,user_experience,user_money,user_money_history,user_cps,user_colour,user_start_ts,user_premium_coins,user_amount_donated,user_titles,user_diamonds,
      prestige_level,
      experience_fishing,experience_fishing_level,experience_woodcutting,experience_woodcutting_level,experience_mining,experience_mining_level,
      gathering_fish,gathering_logs,gathering_ore,
      reputation_total,reputation_given,reputation_given_today,
      premium_status,premium_time,
      ts_profile,ts_reputation,ts_fish,ts_mine,ts_chop,ts_message,ts_commands,ts_crate_daily,ts_crate_premium,
      counter_messages,counter_commands,counter_fishing,counter_fish_caught,counter_woodcutting,counter_woodcutting_chop,counter_mining,counter_mining_ore,counter_money_spent,counter_crates_opened,
      list_fish_inventory,list_fish_inventory_history,list_user_inventory,list_logs_inventory,list_logs_inventory_history,list_ore_inventory,list_ore_inventory_history,
      crate_daily,crate_premium,crate_rare,
      ach_premium,ach_total_spent,ach_commands_used,ach_spammer,ach_speading_love,ach_social,ach_fisher,ach_crate_opener,ach_prestige,ach_woodcutter,ach_miner
    )
    SELECT
    user_id,user_discord,user_level,user_experience,user_money,user_money_history,user_cps,user_colour,user_start_ts,user_premium_coins,user_amount_donated,user_title,user_diamonds,
    prestige_level,
    experience_fishing,experience_fishing_level,experience_woodcutting,experience_woodcutting_level,experience_mining,experience_mining_level,
    gathering_fish,gathering_logs,gathering_ore,
    reputation_total,reputation_given,reputation_given_today,
    premium_status,premium_time,
    ts_profile,ts_reputation,ts_fish,ts_mine,ts_chop,ts_message,ts_commands,ts_crate_daily,ts_crate_premium,
    counter_messages,counter_commands,counter_fishing,counter_fish_caught,counter_woodcutting,counter_woodcutting_chop,counter_mining,counter_mining_ore,counter_money_spent,counter_crates_opened,
    list_fish_inventory,list_fish_inventory_history,list_user_inventory,list_logs_inventory,list_logs_inventory_history,list_ore_inventory,list_ore_inventory_history,
    crate_daily,crate_premium,crate_rare,
    ach_premium,ach_total_spent,ach_commands_used,ach_spammer,ach_speading_love,ach_social,ach_fisher,ach_crate_opener,ach_prestige,ach_woodcutter,ach_miner
    FROM users_old
      `;
  let sql_step_4 = `DROP TABLE users_old`;
  client.db.run(sql_step_1, (err) => {
    if(err) return console.error(`tableupdate.js step 1 - ${err.message}`);
    message.channel.send(`Table \`users\` has been renamed to \`users_old\``);
    client.db.run(sql_step_2, (err) => {
      if(err) return console.error(`tableupdate.js step 2 - ${err.message}`);
      message.channel.send(`Table \`users\` has been created`);
      client.db.run(sql_step_3, (err) => {
        if(err) return console.error(`tableupdate.js step 3 - ${err.message}`);
        message.channel.send(`Table \`users\` has been populated`);
        client.db.run(sql_step_4, (err) => {
          if(err) return console.error(`tableupdate.js step 4 - ${err.message}`);
          message.channel.send(`Table \`users_old\` has been dropped`);
        });
      });
    });
  });
};

exports.conf = {
  aliases: ['u'],
  permLevel: 4
};

exports.help = {
  name: "tableupdate",
  description: "Updates Database",
  usage: "tableupdate"
}
