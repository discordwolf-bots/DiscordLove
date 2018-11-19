const config = require(`./config.json`);
const prefix = config.prefix;

const chalk = require('chalk');
const Discord = require('discord.js');
const client = new Discord.Client();
const ddiff = require('return-deep-diff');
const fs = require('fs');
const moment = require('moment');
const sql = require('sqlite');

client.db = sql.open(`./utils/users.db`);
if(!client.db) return console.log(`Error Connecting`);

require('./utils/eventLoader')(client);


const log = (msg) => {
  console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${msg}`);
}

client.guild_info = (guild, extras) => {
  let sql = `SELECT * FROM guilds WHERE guild_identifier = ${guild}`;
  if(extras != '') sql = `SELECT * FROM guilds WHERE guild_identifier = ${guild} ${extras}`;
  console.log(sql);
  client.db.get(sql, (err, row) => {
    if(err) return console.error(`index.js - ${err.message}`);
    console.log(chalk.bold.red(`client.guild_info`));
    return row;
  });
}
client.user_info = (user, extras) => {
  let sql = `SELECT * FROM users WHERE user_discord = ${user}`;
  if(extras != '') sql = `SELECT * FROM users WHERE user_discord = ${user} ${extras}`;
  client.db.get(sql, (err, row) => {
    if(err) return console.error(`index.js - ${err.message}`);
    console.log(chalk.bold.red(`client.user_info`));
    return row;
  })
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
