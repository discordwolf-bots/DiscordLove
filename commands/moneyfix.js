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

  let sql = `SELECT * FROM users WHERE id = '482644639988580352'`;
  db.get(sql, (err, row) => {
    if(err) return console.error(err.message);
    let sqlFix = `UPDATE users SET money = ${row.money-2000} WHERE id = ${row.id}`;
    db.run(sqlFix, (err) => {
      if(err) return console.error(err.message);
    });
  });

};

exports.conf = {
  aliases: [],
  permLevel: 4
};

exports.help = {
  name: "moneyfix",
  description: "Wolfs current test command",
  usage: "moneyfix"
}
