const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);

const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./utils/users.db', sqlite3.OPEN_READWRITE, (err) => {
  if(err){
    console.error(err.message);
  }
  console.log(`Connected to DB - Test3`);
});

exports.run = function(client, message, args){

  let sql = `UPDATE users SET fishInventory = '31,13,8,1,0,0' WHERE id = ${message.author.id}`;
  db.run(sql, (err) => {
    if(err) console.error(err.message);
  })

};

exports.conf = {
  aliases: ['fixMe'],
  permLevel: 4
};

exports.help = {
  name: "test3",
  description: "Wolfs current test command",
  usage: "test3"
}
