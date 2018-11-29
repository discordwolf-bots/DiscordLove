const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);

Number.prototype.format = function(n, x) {
  var re = '(\\d)(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
  return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$1,');
};

exports.run = function(client, message, args){
  client.guild_info(message.guild.id, '', (guild) => {
    client.user_info(message.author.id, '', (user) => {
      let now = moment().format('x'); // Current UNIX Timestamp
      if(!guild || !user) return;
      // Function to get a users profile colour
      // let embed_colour = '#' + Math.floor(Math.random()*16777215).toString(16);
      let embed_colour = '#' + user.user_colour;
      if(user.user_colour == 'RAND') embed_colour = '#' + Math.floor(Math.random()*16777215).toString(16);

      // Build embed field
      let profile = [];

      // Format username
      let display_name = message.member.displayName;
      if(user.premium_status > 0) display_name = `**[PREMIUM]** ` + display_name;

      // Get users money
      profile.push(`Bank: **$${user.user_money.format(2)}**`);

      // Get users CPS
      profile.push(`BPS: **${user.user_cps.format(1)}** *(bank per second)*`)

      // Display premium duration
      if(user.premium_status > 0){
        // User is a premium user
        if(user.premium_status == 2){
          // Lifetime premium
          profile.push(`Premium Status: **LIFETIME**`);
        } else {
          let premium_time_difference = now - parseInt(user.premium_time);
          let premium_time_display = premium_time_difference * -1;
          let premium_time_format = '';

          let day_millis = 1000 * 60 * 60 * 24;
          let hour_millis = 1000 * 60 * 60;
          let minute_millis = 1000 * 60;
          // How many days?
          if(premium_time_display / day_millis >= 1){
            let premium_days = Math.floor(premium_time_display/day_millis);
            premium_time_format += `${premium_days} day${premium_days > 1 ? 's ' : ' '}`;
            premium_time_display = premium_time_display - (day_millis * premium_days);
          }
          // How many hours?
          if(premium_time_display / hour_millis >= 1){
            let premium_hours = Math.floor(premium_time_display/hour_millis);
            premium_time_format += `${premium_hours} hour${premium_hours > 1 ? 's ' : ' '}`;
            premium_time_display = premium_time_display - (hour_millis * premium_hours);
          }
          // How many minutes?
          if(premium_time_display / minute_millis >= 1){
            let premium_minutes = Math.floor(premium_time_display / minute_millis);
            premium_time_format += `${premium_minutes} minute${premium_minutes > 1 ? 's ' : ' '}`;
            premium_time_display = premium_time_display - (minute_millis * premium_minutes);
          }
          // How many seconds?
          if(premium_time_display > 0){
            let premium_seconds = Math.floor(premium_time_display/1000);
            premium_time_format += `${premium_seconds} second${premium_seconds > 1 ? 's' : ''}`;
          }
          profile.push(`Premium Status: **${premium_time_format}**`);
        }
      } else {
        // User is not premium
        profile.push(`Premium Status: **Not a Premium Member**`);
      }

      // Build embed
      let embed = new Discord.RichEmbed()
        .setColor(embed_colour)
        .setThumbnail(message.author.avatarURL)
        .addField(`Profile of ${display_name}`, profile.join('\n'));
      message.channel.send(embed);
      message.delete();
    });
  });
};

exports.conf = {
  aliases: [],
  permLevel: 0
};

exports.help = {
  name: "profile",
  description: "Displays your profile",
  usage: "profile"
}
