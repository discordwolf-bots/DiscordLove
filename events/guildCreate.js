const Discord = require('discord.js');
const config = require(`../config.json`);
const chalk = require('chalk');
const moment = require('moment');

const log = (msg) => {
  console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${msg}`);
}

module.exports = guild => {
  let client = guild.client;

  let sql = `SELECT * FROM guilds WHERE guild_identifier = ${guild.id}`;
  client.db.get(sql, [], (err, row) => {
    if(err) return console.error(err.message);
    if(row){
      let sql2 = `DELETE FROM guilds WHERE guild_identifier = ${guild.id}`;
      client.db.run(sql2, (err) => {
        if(err) return console.error(err.message);
        client.set_up_server(client, guild);
      });
    } else {
      client.set_up_server(client, guild);
    }
  })
}
