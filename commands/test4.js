const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);

const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./utils/users.db', sqlite3.OPEN_READWRITE, (err) => {
  if(err){
    console.error(err.message);
  }
  console.log(`Connected to DB - Build`);
});

exports.run = function(client, message, args){
//482644639988580352
  let sql = "SELECT * FROM users";
  db.all(sql, (err, rows) => {
    if(err) console.error(err.message);
    rows.forEach((row) => {
      let oldMoney = row.money;
      let newMoney = Math.floor(oldMoney/2);
      let sql2 = `UPDATE users SET money = ${newMoney} WHERE id = ${row.id}`;
      db.run(sql2, (err) => {
        if(err) console.error(err.message);
        message.channel.send(`User <@${row.id}> money has been changed from ${oldMoney} to ${newMoney}`);
      });
    })
  });
};

exports.conf = {
  aliases: ['check'],
  permLevel: 4
};

exports.help = {
  name: "test4",
  description: "Wolfs current test command",
  usage: "test4"
}
