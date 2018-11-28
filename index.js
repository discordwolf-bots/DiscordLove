const config = require(`./config.json`);
const prefix = config.prefix;

const chalk = require('chalk');
const Discord = require('discord.js');
const client = new Discord.Client();
const ddiff = require('return-deep-diff');
const fs = require('fs');
const moment = require('moment');
const sqlite3 = require('sqlite3').verbose();

require('./utils/eventLoader')(client);

const log = (msg) => {
  console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${msg}`);
}

client.db = new sqlite3.Database('./utils/users.db', sqlite3.OPEN_READWRITE, (err) => {
  if(err){
    console.error(err.message);
  }
  console.log(`Connected to DB - Index`);
});
client.guild_info = async (guild, extras, callback) => {
  try {
    let sql = `SELECT * FROM guilds WHERE guild_identifier = ${guild}`;
    if(extras != '') sql = `SELECT * FROM guilds WHERE guild_identifier = ${user} ${extras}`;
    await client.db.get(sql, (err, row) => {
      if(err) return console.error(`index.js - ${err.message}`);
      // console.log(chalk.bold.red(`client.guild_info index.js`));
      // console.log(row);
      return callback(row);
    });
  } catch(e) {
    console.error(e);
  }
}
client.user_info = async (user, extras, callback) => {
  try{
    let sql = `SELECT * FROM users WHERE user_discord = ${user}`;
    if(extras != '') sql = `SELECT * FROM users WHERE user_discord = ${user} ${extras}`;
    await client.db.get(sql, (err, row) => {
      if(err) return console.error(`index.js - ${err.message}`);
      // console.log(chalk.bold.red(`client.user_info index.js`));
      // console.log(row);
      return callback(row);
    });
  } catch(e) {
    console.error(e);
  }
}

client.update_money = async (user_id) => {
  let now = moment().format('x');
  client.user_info(user_id, '', (user) => {
    let time_difference = now - user.ts_message;
    if(user.premium_status > 0) time_difference *= 2;
    let money_to_add = Math.floor(time_difference/1000) * user.user_cps;
    let sql = `UPDATE users SET user_money = ${user.user_money + money_to_add}, ts_message=${now} WHERE user_discord=${user.user_discord}`;
    client.db.run(sql, (err) => {
      if(err) return console.error(`index.js update_money ${err.message}`);
    })
  });
}
client.counter_messages = async (user) => {

}

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();

fs.readdir(`./commands/`, (err, files) => {
  if (err) console.error(err);
  log(chalk.bold.cyan(`Loading ${files.length} Commands`));
  files.forEach(f => {
    let props = require(`./commands/${f}`);
    log(chalk.bold.cyan(`- ${props.help.name}`));
    client.commands.set(props.help.name, props);
    props.conf.aliases.forEach(alias => {
      client.aliases.set(alias, props.help.name);
    });
  });
});

client.reload = function(command){
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./commands/${command}`)];
      let cmd = require(`./commands/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if(cmd === command) client.aliases.delete(alias);
      });
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch(e){
      reject(e);
    }
  });
};

client.elevation = function(msg){
  let perms = 0;
  if(msg.author.id == config.botowner) perms = 4;
  return perms;
}

client.login(config.token);
