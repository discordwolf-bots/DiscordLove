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

  if(guild.id != `480906420133429259`) return;

  embed = new Discord.RichEmbed()
    .setColor("#daa520")
    .setAuthor(`${member.user.username}#${member.user.discriminator}`, member.avatarURL)
    .setFooter(`User Left`)
    .setTimestamp();
  log(chalk.bold.red(`${member.user.username}#${member.user.discriminator}`+ chalk.bold.white(` left `) + chalk.bold.yellow(`${guild}`)));

  client.channels.get(config.users).send({embed: embed});
}
