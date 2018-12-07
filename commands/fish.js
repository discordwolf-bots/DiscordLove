const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);

Number.prototype.format = function(n, x) {
  var re = '(\\d)(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
  return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$1,');
};

const go_fishing = (client, user, message) => {
  let now = moment().format('x'); // Current UNIX Timestamp

  let fail_chance = 0;
  let small_chance = 0;
  let medium_chance = 0;
  let large_chance = 0;
  let super_chance = 0;
  let legendary_chance = 0;
  let magikarp_chance = 0;

  let fishing_cost = 200;

  if(user.premium_status > 0){
    // User is a premium user, give them better odds in fishing
    small_chance = 300;
    medium_chance = 250;
    large_chance = 250;
    super_chance = 120;
    legendary_chance = 78;
    magikarp_chance = 2;
  } else {
    // User is not a premium user, they can suffer
    fail_chance = 250;
    small_chance = 300;
    medium_chance = 200;
    large_chance = 150;
    super_chance = 60;
    legendary_chance = 39;
    magikarp_chance = 1;
  }

  let random_number_fishing = Math.floor(Math.random()*1000); // Random number [0-1000)

  let fail_rate = fail_chance; // 0
  let small_rate = fail_rate + small_chance; // 300
  let medium_rate = small_rate + medium_chance; // 550
  let large_rate = medium_rate + large_chance; // 800
  let super_rate = large_rate + super_chance; // 920
  let legendary_rate = super_rate + legendary_chance; // 998
  let magikarp_rate = legendary_rate + magikarp_chance; // 1000

  let inventory = user.list_fish_inventory.split(',');
  let inventory_history = user.list_fish_inventory_history.split(',');
  let caught_a_fish = true;
  let fish_name = ``;
  let fish_pun = ``;
  if(random_number_fishing < fail_rate){
    caught_a_fish = false;
  } else if(random_number_fishing < small_rate){
    fish_name = `Small Fish`;
    fish_pun = `Oh? There was something there`;
    inventory[0] = parseInt(inventory[0]) + 1;
    inventory_history[0] = parseInt(inventory_history[0]) + 1;
  } else if(random_number_fishing < medium_rate){
    fish_name = `Medium Fish`;
    fish_pun = `Dont be too disappointed, its still something`
    inventory[1] = parseInt(inventory[1]) + 1;
    inventory_history[1] = parseInt(inventory_history[1]) + 1;
  } else if(random_number_fishing < large_rate){
    fish_name = `Large Fish`;
    fish_pun = `It took a bit of a fight, but you won!`
    inventory[2] = parseInt(inventory[2]) + 1;
    inventory_history[2] = parseInt(inventory_history[2]) + 1;
  } else if(random_number_fishing < super_rate){
    fish_name = `Super Fish`;
    fish_pun = `Is it a bird? Is it a plane? I sure hope not, it was in the water.`
    inventory[3] = parseInt(inventory[3]) + 1;
    inventory_history[3] = parseInt(inventory_history[3]) + 1;
  } else if(random_number_fishing < legendary_rate){
    fish_name = `Legendary Fish`;
    fish_pun = `People have spoke of this for decades, but now you have confirmed them to be true!`
    inventory[4] = parseInt(inventory[4]) + 1;
    inventory_history[4] = parseInt(inventory_history[4]) + 1;
  } else if(random_number_fishing < magikarp_rate){
    fish_name = `Magikarp`;
    fish_pun = `Is this meant to be here?`;
    inventory[5] = parseInt(inventory[5]) + 1;
    inventory_history[5] = parseInt(inventory_history[5]) + 1;
  } else {
    message.delete();
    return message.reply(`Something went wrong, please let an Admin know.`);
  }

  if(caught_a_fish){
    // Tell them what fish they caught
    let embed_colour = '#' + user.user_colour;
    if(user.user_colour == 'RAND') embed_colour = '#' + Math.floor(Math.random()*16777215).toString(16);
    let embed = new Discord.RichEmbed()
      .setColor(embed_colour)
      .setAuthor(`${message.member.displayName} caught a ${fish_name}`, message.author.avatarURL)
      .setFooter(fish_pun);
    message.channel.send(embed);
  }

  let sql_update_fish_inventory = `UPDATE users SET user_money = ${user.user_money - fishing_cost}, list_fish_inventory = '${inventory.join(',')}', list_fish_inventory_history = '${inventory_history.join(',')}', counter_fishing = ${user.counter_fishing + 1}, counter_fish_caught = ${user.counter_fish_caught + (caught_a_fish ? 1 : 0)}, ts_fish = ${now} WHERE user_discord = ${user.user_discord}`;
  // message.channel.send(sql_update_fish_inventory);
  client.db.run(sql_update_fish_inventory, (err) => {
    if(err) return console.error(`fish.js go_fishing() ${err.message}`);
  })

}

const sell_fish = (client, user, message, type) => {

}

const view_inventory = (client, user, message) => {
  let inventory = user.list_fish_inventory.split(',');

  let small_fish_emoji = `:SmallFish:517449760349618206`;
  let medium_fish_emoji = `:MediumFish:517449758940332053`;
  let large_fish_emoji = `:LargeFish:517449759372607507`;
  let super_fish_emoji = `:SuperFish:517449759963873302`;
  let legendary_fish_emoji = `:LegendaryFish:517449759313887283`;
  let magikarp_fish_emoji = `:Magikarp:517449753970212875`;

  let embed_colour = '#' + user.user_colour;
  if(user.user_colour == 'RAND') embed_colour = '#' + Math.floor(Math.random()*16777215).toString(16);
  let embed = new Discord.RichEmbed()
    .setAuthor(`Fishing Inventory of ${message.member.displayName}`, message.author.avatarURL)
    .setColor(embed_colour)
    .addField(`<${small_fish_emoji}> Small Fish`, `\`\`\`${parseInt(inventory[0]).format(0)}\`\`\``, true)
    .addField(`<${medium_fish_emoji}> Medium Fish`, `\`\`\`${parseInt(inventory[1]).format(0)}\`\`\``, true)
    .addField(`<${large_fish_emoji}> Large Fish`, `\`\`\`${parseInt(inventory[2]).format(0)}\`\`\``, true)
    .addField(`<${super_fish_emoji}> Super Fish`, `\`\`\`${parseInt(inventory[3]).format(0)}\`\`\``, true)
    .addField(`<${legendary_fish_emoji}> Legendary Fish`, `\`\`\`${parseInt(inventory[4]).format(0)}\`\`\``, true)
    .addField(`<${magikarp_fish_emoji}> Magikarp`, `\`\`\`${parseInt(inventory[5]).format(0)}\`\`\``, true)
    .setTimestamp();
  message.channel.send(embed);
}

const view_inventory_history = (client, user, message) => {
  let inventory = user.list_fish_inventory_history.split(',');

  let small_fish_emoji = `:SmallFish:517449760349618206`;
  let medium_fish_emoji = `:MediumFish:517449758940332053`;
  let large_fish_emoji = `:LargeFish:517449759372607507`;
  let super_fish_emoji = `:SuperFish:517449759963873302`;
  let legendary_fish_emoji = `:LegendaryFish:517449759313887283`;
  let magikarp_fish_emoji = `:Magikarp:517449753970212875`;

  let embed_colour = '#' + user.user_colour;
  if(user.user_colour == 'RAND') embed_colour = '#' + Math.floor(Math.random()*16777215).toString(16);
  let embed = new Discord.RichEmbed()
    .setAuthor(`Fishing Inventory (All-Time) of ${message.member.displayName}`, message.author.avatarURL)
    .setColor(embed_colour)
    .addField(`<${small_fish_emoji}> Small Fish`, `\`\`\`${parseInt(inventory[0]).format(0)}\`\`\``, true)
    .addField(`<${medium_fish_emoji}> Medium Fish`, `\`\`\`${parseInt(inventory[1]).format(0)}\`\`\``, true)
    .addField(`<${large_fish_emoji}> Large Fish`, `\`\`\`${parseInt(inventory[2]).format(0)}\`\`\``, true)
    .addField(`<${super_fish_emoji}> Super Fish`, `\`\`\`${parseInt(inventory[3]).format(0)}\`\`\``, true)
    .addField(`<${legendary_fish_emoji}> Legendary Fish`, `\`\`\`${parseInt(inventory[4]).format(0)}\`\`\``, true)
    .addField(`<${magikarp_fish_emoji}> Magikarp`, `\`\`\`${parseInt(inventory[5]).format(0)}\`\`\``, true)
    .setTimestamp();
  message.channel.send(embed);
}

const fishing_help = (client, user, message) => {

}

const fishing_sell_help = (client, user, message) => {

}


exports.run = function(client, message, args){
  client.guild_info(message.guild.id, '', (guild) => {
    client.user_info(message.author.id, '', (user) => {
      if(!guild) return message.reply(`Please re-invite the bot`);
      if(!user) return message.reply(`Please start your account`);

      let now = moment().format('x'); // Current UNIX Timestamp
      let day_millis = 1000 * 60 * 60 * 24;
      let hour_millis = 1000 * 60 * 60;
      let minute_millis = 1000 * 60;

      let check_channel = true;
      if(user.user_discord == config.botowner) check_channel = false;
      if(guild.channel_main != message.channel.id && check_channel){
        message.delete();
        return message.reply(`Please only use this command in <#${guild.channel_main}>`).then(msg => msg.delete(5000));
      }

      let fishing_time_display = (now - (parseInt(user.ts_fish) + (minute_millis * 5))) * -1;
      let fishing_minutes = ``;
      let fishing_seconds = ``;
      let fishing_timer = ``;

      if(!args[0]){ // =fish
        if(now - user.ts_fish < 5 * 60 * 1000) {
          message.delete();
          if(fishing_time_display / minute_millis >= 1){
            fishing_minutes = Math.floor(fishing_time_display / minute_millis);
            fishing_timer += `${fishing_minutes} minute${fishing_minutes > 1 ? 's' : ''} `;
            fishing_time_display = fishing_time_display - (minute_millis * fishing_minutes);
          }
          // How many seconds?
          if(fishing_time_display > 0){
            fishing_seconds = Math.ceil(fishing_time_display/1000);
            fishing_timer += `${fishing_seconds} second${fishing_seconds > 1 ? 's' : ''}`;
          }
          return message.reply(`Please wait another **${fishing_timer}** before going fishing again.`).then(msg => msg.delete(5000));
        } else {
          go_fishing(client, user, message);
        }
      } else {
        switch(args[0].toLowerCase()){ // =fish <args[0]>
          default:
          case `fish`:
          case `catch`:
          if(now - user.ts_fish < 5 * 60 * 1000) {
            message.delete();
            if(fishing_time_display / minute_millis >= 1){
              fishing_minutes = Math.floor(fishing_time_display / minute_millis);
              fishing_timer += `${fishing_minutes} minute${fishing_minutes > 1 ? 's' : ''} `;
              fishing_time_display = fishing_time_display - (minute_millis * fishing_minutes);
            }
            // How many seconds?
            if(fishing_time_display > 0){
              fishing_seconds = Math.ceil(fishing_time_display/1000);
              fishing_timer += `${fishing_seconds} second${fishing_seconds > 1 ? 's' : ''}`;
            }
            return message.reply(`Please wait another **${fishing_timer}** before going fishing again.`).then(msg => msg.delete(5000));
          } else {
            go_fishing(client, user, message);
          }
            break;

          case `sell`:
            if(!args[1]){ // =fish sell
                fishing_sell_help(client, user, message);
            } else { // =fish sell <args[1]>
              switch(args[1].toLowerCase()){
                default:
                  break;
                case `small`:
                case `medium`:
                case `large`:
                case `super`:
                case `legendary`:
                case `magikarp`: // =fish sell magikarp
                case `all`: // =fish sell all
                  sell_fish(client, user, message, args[1].toLowerCase());
                  break;
              }
            }
            break;

          case `inventory`:
          case `invent`:
          case `inv`:
            view_inventory(client, user, message);
            break;

          case `history`:
          case `all-time`:
          case `alltime`:
          case `hist`:
            view_inventory_history(client, user, message);
            break;

          case `help`:
          case `halp`:
          case `info`:
          case `imstuck`:
            fishing_help(client, user, message);
            break;
        }
      }


    });
  });
};

exports.conf = {
  aliases: [],
  permLevel: 0
};

exports.help = {
  name: "fish",
  description: "Starts fishing",
  usage: "fish"
}
