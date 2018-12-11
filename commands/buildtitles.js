const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);

exports.run = function(client, message, args){

  let sql = `CREATE TABLE IF NOT EXISTS titles (
    title_id INTEGER PRIMARY KEY ASC,
    title_text TEXT,
    title_buyable INTEGER DEFAULT 0,
    title_cost REAL DEFAULT 0

  )`;
  client.db.run(sql, (err) => {
    if(err){
      return console.error(err.message);
    }
    message.channel.send(`Table \`titles\` has been created`)
  });
};

exports.conf = {
  aliases: ['b3'],
  permLevel: 4
};

exports.help = {
  name: "buildtitles",
  description: "Builds Titles Database",
  usage: "buildtitles"
}
