const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);

const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./utils/users.db', sqlite3.OPEN_READWRITE, (err) => {
  if(err){
    console.error(err.message);
  }
  console.log(`Connected to DB - Tablefix`);
});

exports.run = function(client, message, args){
  let sql = `
  PRAGMA foreign_keys=off;

  BEGIN TRANSACTION;

  ALTER TABLE users RENAME TO _users_old;

  CREATE TABLE IF NOT EXISTS users (
    id TEXT,
    userID INTEGER PRIMARY KEY ASC,
    money INTEGER DEFAULT 100,
    cost INTEGER DEFAULT 100,
    owner TEXT DEFAULT 0,
    lastpurchase TEXT DEFAULT 0,
    lastprofile TEXT DEFAULT 0,
    lastmessage TEXT DEFAULT 0,
    achieve_your_value INTEGER DEFAULT 0,
    achieve_owned_value INTEGER DEFAULT 0,
    achhieve_buy_the_bot INTEGER DEFAULT 0
  );

  INSERT INTO users (id, userID, money, cost, owner, lastpurchase, lastprofile, lastmessage)
    SELECT id, userID, money, cost, owner, lastpurchase, lastprofile, lastmessage
    FROM _users_old;

  COMMIT;

  PRAGMA foreign_keys=on;
  `;

  db.run(sql, [], (err) => {
    if(err) return console.error(err.message);
    console.log(`Table altered successfully`);
  })
};

exports.conf = {
  aliases: [],
  permLevel: 4
};

exports.help = {
  name: "tablefix",
  description: "Table fix",
  usage: "tablefix"
}
