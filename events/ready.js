const chalk = require('chalk');
const config = require('../config.json');
const moment = require('moment');
const Discord = require(`discord.js`);

const log = (msg) => {
  console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${msg}`);
}

const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./utils/users.db', sqlite3.OPEN_READWRITE, (err) => {
  if(err){
    console.error(err.message);
  }
  console.log(`Connected to DB - Message`);
});

module.exports = client => {
  let sql = `SELECT * FROM users`;
  db.all(sql, [], (err, rows) => {
    if(err) return console.error(err.message);
    let value = 0;
    let counter = 0;
    rows.forEach((row) => {
      counter++;
      value += row.cost - 100;
    });
    client.user.setActivity(`${counter.format(0)} users worth \$${value.format(0)}`);
  });
  log(chalk.green(`Bot Started`));
}
