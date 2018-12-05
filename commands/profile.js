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

      let sql_count_users = `SELECT count(*) AS count FROM users`;
      client.db.get(sql_count_users, (err, total) => {
        if(err) return console.error(`profile.js select_count ${err.message}`);

        let total_users = total.count;
        let now = moment().format('x'); // Current UNIX Timestamp
        if(!guild) return message.reply(`Please re-invite the bot`);
        if(!user) return message.reply(`Please start your account`);

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
        let crate_array = [];
        let counter_array = [];

        let total_users_number_length = total_users.toString().length;
        let user_account_number = '';
        for(let i=1; i<total_users_number_length; i++){
          user_account_number += '0';
        }

        // Format username
        let display_name = message.member.displayName;
        if(user.premium_status == 1) display_name = `~Premium~ ${message.member.displayName}`;
        if(user.premium_status == 2) display_name = `~Lifetime~ ${message.member.displayName}`;


        // Get users Premium
        if(user.premium_status > 0){
          // User is a premium user
          if(user.premium_status == 2){
            // Lifetime premium
            premium_array.push(`Premium Status: **Lifetime**`);
          } else {
            let premium_time_difference = now - parseInt(user.premium_time);
            let premium_time_display = premium_time_difference * -1;
            let premium_time_format = '';
            let premium_days = '00';
            let premium_hours = '00';
            let premium_minutes = '00';
            let premium_seconds = '00';

            // How many days?
            if(premium_time_display / day_millis >= 1){
              premium_days += Math.floor(premium_time_display/day_millis);
              premium_time_display = premium_time_display - (day_millis * premium_days);
            }
            // How many hours?
            if(premium_time_display / hour_millis >= 1){
              premium_hours += Math.floor(premium_time_display/hour_millis);
              premium_time_display = premium_time_display - (hour_millis * premium_hours);
            }
            // How many minutes?
            if(premium_time_display / minute_millis >= 1){
              premium_minutes += Math.floor(premium_time_display / minute_millis);
              premium_time_display = premium_time_display - (minute_millis * premium_minutes);
            }
            // How many seconds?
            if(premium_time_display > 0){
              premium_seconds += Math.floor(premium_time_display/1000);
            }
            premium_array.push(`Premium Status: **${premium_days.slice(-2)}:${premium_hours.slice(-2)}:${premium_minutes.slice(-2)}:${premium_seconds.slice(-2)}**\n`);
          }
        } else {
          // User is not premium
          premium_array.push(`Premium Status: **NaN**\n`);
        }

        // Get users premium coins
        premium_array.push(`Premium Coins: **${user.user_premium_coins.format(0)}**`)

        // Get users total donated
        premium_array.push(`Total Donated: **£${user.user_amount_donated.format(2)}**`)

        // Show level and experience
        let next_level_requirement = Math.floor(Math.pow(user.user_level+1, 1.8)*100);
        user_array.push(`Level: **${user.user_level.format(0)}** *${(next_level_requirement - user.user_experience).format(0)} XP Remaining*`)


        // Get users account number
        user_array.push(`Account Number: **#${(user_account_number + user.user_id).slice(((total_users_number_length-1)*-1))}**`);

        // Get users money
        user_array.push(`Bank: **$${user.user_money.format(2)}**`);

        // Get users CPS
        user_array.push(`BPS: **${user.user_cps.format(1)}** *(bank per second)*`)

        // Get account length
        let account_length_display = (parseInt(user.user_start_ts) - now) * -1;
        let account_length_days = '00';
        let account_length_hours = '00';
        let account_length_minutes = '00';
        let account_length_seconds = '00';

        // How many days?
        if(account_length_display / day_millis >= 1){
          account_length_days += Math.floor(account_length_display/day_millis);
          account_length_display = account_length_display - (day_millis * account_length_days);
        }
        // How many hours?
        if(account_length_display / hour_millis >= 1){
          account_length_hours += Math.floor(account_length_display/hour_millis);
          account_length_display = account_length_display - (hour_millis * account_length_hours);
        }
        // How many minutes?
        if(account_length_display / minute_millis >= 1){
          account_length_minutes += Math.floor(account_length_display / minute_millis);
          account_length_display = account_length_display - (minute_millis * account_length_minutes);
        }
        // How many seconds?
        if(account_length_display > 0){
          account_length_seconds += Math.floor(account_length_display/1000);
        }
        user_array.push(`Account Length: **${account_length_days.slice(-2)}:${account_length_hours.slice(-2)}:${account_length_minutes.slice(-2)}:${account_length_seconds.slice(-2)}**\n`);

        // Get users Reputation
        let reputation_hours = '00';
        let reputation_minutes = '00';
        let reputation_seconds = '00';
        reputation_array.push(`Reputation Received: **${user.reputation_total.format(0)}**`);
        reputation_array.push(`Reputation Given: **${user.reputation_given.format(0)}**`);
        if((user.reputation_given_today < 2 && user.premium_status > 0) || (user.reputation_given_today < 1)){
          reputation_array.push(`Next Reputation: **Now (${user.reputation_given_today} / ${user.premium_status == 0 ? '1' : '2'})**`);
        } else {
          let reputation_24_added = parseInt(user.ts_reputation) + day_millis;
          let reputation_time_display = (now - reputation_24_added) * -1;
          // How many hours?
          if(reputation_time_display / hour_millis >= 1){
            reputation_hours += Math.floor(reputation_time_display/hour_millis);
            reputation_time_display = reputation_time_display - (hour_millis * reputation_hours);
          }
          // How many minutes?
          if(reputation_time_display / minute_millis >= 1){
            reputation_minutes += Math.floor(reputation_time_display / minute_millis);
            reputation_time_display = reputation_time_display - (minute_millis * reputation_minutes);
          }
          // How many seconds?
          if(reputation_time_display > 0){
            reputation_seconds += Math.floor(reputation_time_display/1000);
          }
          reputation_array.push(`Next Reputation: **${reputation_hours.slice(-2)}:${reputation_minutes.slice(-2)}:${reputation_seconds.slice(-2)}**`);
        }

        // How many rare crates?
        crate_array.push(`Rare Crates: **${user.crate_rare}**`);

        // Get users messages sent
        let counter_message_display = (now - (parseInt(user.ts_message) + minute_millis)) * -1;
        let counter_message_seconds = '';
        if(counter_message_display > 0){
          counter_message_seconds += Math.floor(counter_message_display/1000);
        } else {
          counter_message_seconds = '60';
        }
        counter_array.push(`Messages: **${user.counter_messages.format(0)}** (${counter_message_seconds}s)`)

        // Get users commands used
        let counter_commands_display = (now - (parseInt(user.ts_commands) + minute_millis)) * -1;
        let counter_commands_seconds = '';
        if(counter_commands_display > 0){
          counter_commands_seconds += Math.floor(counter_commands_display/1000);
        } else {
          counter_commands_seconds = '60';
        }
        counter_array.push(`Commands: **${(user.counter_commands + (counter_commands_display <= 0 ? 1 : 0)).format(0)}** (${counter_commands_seconds}s)`)


        // Build embed
        let embed = new Discord.RichEmbed()
          .setColor(embed_colour)
          .setTitle(`Profile of ${display_name}`)
          .setThumbnail(message.author.avatarURL)
          .addField(`Premium`, premium_array.join('\n'))
          .addField(`User`, user_array.join(`\n`))
          .addField(`Reputation`, reputation_array.join(`\n`))
          .addField(`Crates`, crate_array.join(`\n`))
          .addField(`Counters`, counter_array.join(`\n`))
          .setTimestamp();
        message.channel.send(embed);
        message.delete();

        if(now - user.ts_commands > 60 * 1000){
          let sql_update_command_counter = `UPDATE users SET counter_commands = ${user.counter_commands+1}, ts_commands = ${now} WHERE user_discord = ${user.user_discord}`;
          client.db.run(sql_update_command_counter, (err) => {
            if(err) return console.error(`profile.js sql_update_command_counter ${err.message}`);
          })
        }


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
