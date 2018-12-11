const chalk = require('chalk');
const config = require('../config.json');
const moment = require('moment');
const Discord = require(`discord.js`);

const log = (msg) => {
  console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${msg}`);
}

Number.prototype.format = function(n, x) {
  var re = '(\\d)(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
  return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$1,');
};

module.exports = async client => {
  client.user.setPresence({
    game : {
      name : `on ${client.guilds.size.format(0)} servers`,
      type: 0
    }
  });
  // client.user.setPresence({
  //   game : {
  //     name : `Live Coding for ${client.guilds.size.format(0)} servers`,
  //     type: `STREAMING`,
  //     url: `https://twitch.tv/discordwolf`
  //   }
  // });
  await client.getInfoValues(client);
  log(chalk.green(`Bot Started`));
}
