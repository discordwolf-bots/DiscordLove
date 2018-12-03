const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);

exports.run = function(client, message, args){

  let sql = `CREATE TABLE IF NOT EXISTS guilds (
    guild_id INTEGER PRIMARY KEY ASC,
    guild_identifier TEXT,
    guild_owner TEXT,

    channel_setup TEXT,
    channel_main TEXT,

    list_allowed TEXT DEFAULT ''

  )`;
  client.db.run(sql, (err) => {
    if(err){
      return console.error(err.message);
    }
    message.channel.send(`Table \`guilds\` has been created`)
  });
};

exports.conf = {
  aliases: ['b2'],
  permLevel: 4
};

exports.help = {
  name: "buildguild",
  description: "Builds Guild Database",
  usage: "buildguild"
}
