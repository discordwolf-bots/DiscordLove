const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);

const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./utils/users.db', sqlite3.OPEN_READWRITE, (err) => {
  if(err){
    console.error(err.message);
  }
  console.log(`Connected to DB - Profile`);
});

Number.prototype.format = function(n, x) {
  var re = '(\\d)(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
  return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$1,');
};

exports.run = function(client, message, args){
  message.delete();
  client.guild_info(message.guild.id, '', (guild) => {
    client.user_info(message.author.id, '', (user) => {
      if(!guild || !user) return;
      // Function to get a users profile colour
      let embed_colour = '#' + Math.floor(Math.random()*16777215).toString(16);
      // let embed_colour = '#' + user.user_colour;
      // if(user.user_colour == 'RAND') embed_colour = '#' + Math.floor(Math.random()*16777215).toString(16);

      // Build embed field
      let profile = [];

      // Format username
      let display_name = message.member.displayName;
      if(user.premium_status > 0) display_name = `**[PREMIUM]** ${display_name}`;
      profile.push(`Profile of ${display_name}`);

      // Get users money
      profile.push(`Bank: **$${user.user_money.format(2)}**`);

      // Get users CPS
      profile.push(`BPS: **${user.user_cps.format(1)}** *(bank per second)*`)

      // Build embed
      let embed = new Discord.RichEmbed()
        .setColor(embed_colour)
        .setThumbnail(message.author.avatarURL)
        .addField(profile.join('\n'));
      message.channel.send(embed);
    });
  });
};

exports.conf = {
  aliases: [],
  permLevel: 4
};

exports.help = {
  name: "profile",
  description: "Displays your profile",
  usage: "profile"
}
