const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);
const sqlite = require('sqlite');
const db = sqlite.open(`./utils/users.db`);

exports.run = async (client, message, args) => {
  let sql = `SELECT * FROM users WHERE user_discord = ${message.author.id}`;
  db.get(sql, (err, row) => {
    if(err) return console.error(err.message);
    console.log(row);
  });
  // let guild = await client.guild_info(message.guild.id, '');
  // let user = await client.user_info(message.author.id, '');

  console.log(guild);
  console.log(user);
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
