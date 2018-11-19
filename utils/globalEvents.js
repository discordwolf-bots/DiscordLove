const chalk = require('chalk');
const sqlite3 = require('sqlite3').verbose();

exports.db = new sqlite3.Database('./utils/users.db', sqlite3.OPEN_READWRITE, (err) => {
  if(err){
    console.error(err.message);
  }
  console.log(`Connected to DB - Index`);
});

exports.guild_info = function(guild, db){
  let sql = `SELECT * FROM guilds WHERE guild_identifier = ${guild}`;
  db.get(sql, (err, row) => {
    if(err) return console.error(`message.js - ${err.message}`);
    console.log(chalk.bold.red(`global.guild_info index.js`));
    console.log(row);
    return row;
  });
}

exports.user_info = function(user, db){
  let sql = `SELECT * FROM users WHERE user_discord = ${user}`;
  db.get(sql, (err, row) => {
    if(err) return console.error(`message.js - ${err.message}`);
    console.log(chalk.bold.red(`global.user_info index.js`));
    console.log(row);
    return row;
  })
}
