const chalk = require('chalk');
const config = require('../config.json');
const moment = require('moment');
const Discord = require(`discord.js`);

const log = (msg) => {
  console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${msg}`);
}

module.exports = client => {
  client.user.setActivity(`on ${client.guilds.size.format(0)} servers`);
  log(chalk.green(`Bot Started`));
}
