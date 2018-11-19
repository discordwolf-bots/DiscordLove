const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);
const sqlite3 = require('sqlite3').verbose();

exports.run = async function(client, message, args){

  client.guild_info(message.guild.id, '', (guild) => {
    client.user_info(message.author.id, '', (user) => {
      if(!guild || !user) return;
      let sql = `UPDATE users SET user_cps = ${user.user_cps+0.5} WHERE user_discord = ${user.user_discord}`;
      client.db.run(sql, (err) => {
        if(err) return console.error(err.message);
      })
    });
  });

};

exports.conf = {
  aliases: [],
  permLevel: 4
};

exports.help = {
  name: "testing",
  description: "Ping/Pong Command",
  usage: "ping"
}
