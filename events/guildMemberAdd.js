const Discord = require('discord.js');
const config = require(`../config.json`);
const chalk = require('chalk');
const moment = require('moment');

const log = (msg) => {
  console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${msg}`);
}

module.exports = member => {
  let guild = member.guild;
  let client = member.client;
  embed = new Discord.RichEmbed()
    .setColor("#00A30D")
    .setAuthor(`${member.user.username}#${member.user.discriminator}`, member.avatarURL)
    .setFooter(`User Joined`)
    .setTimestamp();
  log(chalk.bold.red(`${member.user.username}#${member.user.discriminator}`+ chalk.bold.white(` joined `) + chalk.bold.yellow(`${guild}`)));

  client.channels.get(config.users).send({embed: embed});
}
