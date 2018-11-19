const config = require(`../config.json`);

const Discord = require(`discord.js`);
const fs = require('fs');
const chalk = require('chalk');
const ms = require('ms');
const moment = require('moment');

const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./utils/users.db', sqlite3.OPEN_READWRITE, (err) => {
  if(err){
    console.error(err.message);
  }
  console.log(`Connected to DB - Message`);
});

const getGuild = (guild) => {
  let sql = `SELECT * FROM guilds WHERE guild_identifier = ${guild}`;
  db.get(sql, (err, row) => {
    if(err) return console.error(`message.js - ${err.message}`);
    return row;
  });
}

const getUser = (user) => {
  let sql = `SELECT * FROM users WHERE user_discord = ${user}`;
  db.get(sql, (err, row) => {
    if(err) return console.error(`message.js - ${err.message}`);
    return row;
  })
}

module.exports = message => {
  try {
    if(message.author.bot) return; // Is it a bot talking?
    if(message.channel.type !== "text") return; // Is it actually a text channel?

    const client = message.client; // Give us a `client` variable
    const params = message.content.replace(/ +(?= )/g,'').split(' ').slice(1); // Remove all double spaces
    client.guildinfo = getGuild(message.guild.id); // Get the guild info from the database
    let userRow = getUser(message.author.id);
    if(userRow) client.userinfo = userRow;

    let now = moment().format('x'); // Current UNIX Timestamp



    if(message.guild.id != '480906420133429259') return;

    var command = "";
    var bool = false;
    var giveExp = true;

    if(message.content.startsWith(config.prefix)){
      command = message.content.split(' ')[0].slice(config.prefix.length).toLowerCase();
      bool = true;
      giveExp = false;
    }

    if(bool){
      let perms = client.elevation(message);
      let cmd;
      if(client.commands.has(command)){
        cmd = client.commands.get(command);
      } else if(client.aliases.has(command)){
        cmd = client.commands.get(client.aliases.get(command));
      }
      if(cmd){
        if(perms < cmd.conf.permLevel){
          let embed = new Discord.RichEmbed()
            .setColor(`#ff0000`)
            .addField(`Error!`, `You do not have the permissions to use ${command}`)
            .setTimestamp();
          return message.channel.send({embed : embed});
        }
        cmd.run(client, message, params, perms);
      }
    }

  } catch(e) {
    console.log(e.stack);
  }
}
