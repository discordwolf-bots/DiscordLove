const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);

exports.run = function(client, message, args){

  let sql = `ALTER TABLE users RENAME TO _users_old;`;
  client.db.run(sql, (err) => {
    if(err) return console.error(err.message);
    message.channel.send(`Table renamed to _users_old`);
  });

};

exports.conf = {
  aliases: ['1'],
  permLevel: 4
};

exports.help = {
  name: "updatetable1",
  description: "Wolfs current test command",
  usage: "updatetable1"
}
