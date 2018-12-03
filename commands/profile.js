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
      if(!guild) return message.reply(`Please re-invite the bot`);
      if(!user) return message.reply(`Please start your account`);
      client.update_money(message.author.id, () => {

        let day_millis = 1000 * 60 * 60 * 24;
        let hour_millis = 1000 * 60 * 60;
        let minute_millis = 1000 * 60;
        // Function to get a users profile colour
        // let embed_colour = '#' + Math.floor(Math.random()*16777215).toString(16);
        let embed_colour = '#' + user.user_colour;
        if(user.user_colour == 'RAND') embed_colour = '#' + Math.floor(Math.random()*16777215).toString(16);

        // Build embed field
        let user_array = [];
        let premium_array = [];
        let reputation_array = [];

        // Format username
        let display_name = message.member.displayName;
        if(user.premium_status == 1) display_name = `~Premium~ ${message.member.displayName}`;
        if(user.premium_status == 2) display_name = `~Lifetime~ ${message.member.displayName}`;

        // Get users Premium
        if(user.premium_status > 0){
          // User is a premium user
          if(user.premium_status == 2){
            // Lifetime premium
            premium_array.push(`Premium Status: **Lifetime Premium**`);
          } else {
            let premium_time_difference = now - parseInt(user.premium_time);
            let premium_time_display = premium_time_difference * -1;
            let premium_time_format = '';

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
            premium_array.push(`Premium Status: **${premium_time_format}**\n`);
          }
        } else {
          // User is not premium
          premium_array.push(`Premium Status: **Not a Premium Member**\n`);
        }

        // Get users money
        user_array.push(`Bank: **$${user.user_money.format(2)}**`);

        // Get users CPS
        user_array.push(`BPS: **${user.user_cps.format(1)}** *(bank per second)*`)


        // Get users Reputation
        reputation_array.push(`Reputation Received: **${user.reputation_total.format(0)}**`);
        reputation_array.push(`Reputation Given: **${user.reputation_given.format(0)}**`);
        if((user.reputation_given_today < 2 && user.premium_status > 0) || (user.reputation_given_today < 1)){
          reputation_array.push(`Next Reputation: **Now**`);
        } else {
          let reputation_24_added = parseInt(user.ts_reputation) + day_millis;
          let reputation_time_display = (now - reputation_24_added) * -1;
          let reputation_time_format = '';
          // How many hours?
          if(reputation_time_display / hour_millis >= 1){
            let reputation_hours = Math.floor(reputation_time_display/hour_millis);
            reputation_time_format += `${reputation_hours} hour${reputation_hours > 1 ? 's ' : ' '}`;
            reputation_time_display = reputation_time_display - (hour_millis * reputation_hours);
          }
          // How many minutes?
          if(reputation_time_display / minute_millis >= 1){
            let reputation_minutes = Math.floor(reputation_time_display / minute_millis);
            reputation_time_format += `${reputation_minutes} minute${reputation_minutes > 1 ? 's ' : ' '}`;
            reputation_time_display = reputation_time_display - (minute_millis * reputation_minutes);
          }
          // How many seconds?
          if(reputation_time_display > 0){
            let reputation_seconds = Math.floor(reputation_time_display/1000);
            reputation_time_format += `${reputation_seconds} second${reputation_seconds > 1 ? 's' : ''}`;
          }
          reputation_array.push(`Next Reputation: **${reputation_time_format}**`);
        }


        // Build embed
        let embed = new Discord.RichEmbed()
          .setColor(embed_colour)
          .setTitle(`Profile of ${display_name}`)
          .setThumbnail(message.author.avatarURL)
          .addField(`Premium`, premium_array.join('\n'), true)
          .addField(`User`, user_array.join(`\n`), true)
          .addField(`Reputation`, reputation_array.join(`\n`), true)
          .setTimestamp();
        message.channel.send(embed);
        message.delete();
      })
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
