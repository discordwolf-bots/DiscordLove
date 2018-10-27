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

  let sql = `INSERT INTO users (id, userID, money, cost, owner, lastpurchase, lastprofile, lastmessage, achieve_your_value, achieve_owned_value, achieve_buy_the_bot)
    SELECT id, userID, money, cost, owner, lastpurchase, lastprofile, lastmessage, achieve_your_value, achieve_owned_value, achieve_buy_the_bot
    FROM _users_old`;
  db.run(sql, (err) => {
    if(err) return console.error(err.message);
  });

};

exports.conf = {
  aliases: [],
  permLevel: 4
};

exports.help = {
  name: "updatetable2",
  description: "Wolfs current test command",
  usage: "updatetable2"
}
