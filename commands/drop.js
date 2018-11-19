const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);

exports.run = function(client, message, args){
  let sql = `DROP TABLE users`;
  client.db.run(sql, (err) => {
    if(err) return console.error(err.message);
    console.log(`Table deleted`);
  });
};

exports.conf = {
  aliases: [],
  permLevel: 4
};

exports.help = {
  name: "drop",
  description: "Deletes Table",
  usage: "drop"
}
