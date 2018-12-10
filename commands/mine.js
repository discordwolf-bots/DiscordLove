const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);

Number.prototype.format = function(n, x) {
  var re = '(\\d)(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
  return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$1,');
};

const go_mining = (client, user, message) => {
  let now = moment().format('x'); // Current UNIX Timestamp

  let fail_chance = 0;
  let copper_chance = 0;
  let nickel_chance = 0;
  let lead_chance = 0;
  let amethyst_chance = 0;
  let gold_chance = 0;
  let uranium_chance = 0;

  let fail_experience_max = 0;
  let copper_experience_min = 5;
  let copper_experience_max = 10;
  let nickel_experience_min = 10;
  let nickel_experience_max = 20;
  let lead_experience_min = 20;
  let lead_experience_max = 30;
  let amethyst_experience_min = 30;
  let amethyst_experience_max = 50;
  let gold_experience_min = 50;
  let gold_experience_max = 70;
  let uranium_experience_min = 70;
  let uranium_experience_max = 250;

  let mining_cost = 400;

  if(user.premium_status > 0){
    // User is a premium user, give them better odds in fishing
    copper_chance = 300;
    nickel_chance = 250;
    lead_chance = 250;
    amethyst_chance = 120;
    gold_chance = 78;
    uranium_chance = 2;
  } else {
    // User is not a premium user, they can suffer
    fail_chance = 250;
    copper_chance = 300;
    nickel_chance = 200;
    lead_chance = 150;
    amethyst_chance = 60;
    gold_chance = 39;
    uranium_chance = 1;
  }

  if(user.user_money < mining_cost) return message.reply(`You need **$${mining_cost}** to mine *(currently have $${user.user_money})*`);

  let random_number_mining = Math.floor(Math.random()*1000); // Random number [0-1000)

  let fail_rate = fail_chance; // 0
  let copper_rate = fail_rate + copper_chance; // 300
  let nickel_rate = copper_rate + nickel_chance; // 550
  let lead_rate = nickel_rate + lead_chance; // 800
  let amethyst_rate = lead_rate + amethyst_chance; // 920
  let gold_rate = amethyst_rate + gold_chance; // 998
  let uranium_rate = gold_rate + uranium_chance; // 1000

  let inventory = user.list_ore_inventory.split(',');
  let inventory_history = user.list_ore_inventory_history.split(',');
  let mined_an_ore = true;
  let ore_name = ``;
  let ore_pun = ``;
  let mine_emoji = ``;
  let mine_emoji_part = ``;

  let experience_gained = 0;

  if(random_number_mining < fail_rate){
    mined_an_ore = false;
    experience_gained = ((user.premium_status > 0 ? 2 : 1) * (Math.floor(Math.random() * fail_experience_max))+1);
  } else if(random_number_mining < copper_rate){
    ore_name = `Copper Ore`;
    mine_emoji_part = client.mine_emoji[0].slice(1, client.mine_emoji[0].length);
    mine_emoji = mine_emoji_part.slice(mine_emoji_part.indexOf(`:`)+1, mine_emoji_part.length);
    ore_pun = `I thought it was a Policeman`;
    inventory[0] = parseInt(inventory[0]) + 1;
    inventory_history[0] = parseInt(inventory_history[0]) + 1;
    experience_gained = ((user.premium_status > 0 ? 2 : 1) * (Math.floor(Math.random() * ((copper_experience_max - copper_experience_min) + 1) + copper_experience_min)));
  } else if(random_number_mining < nickel_rate){
    mine_emoji_part = client.mine_emoji[1].slice(1, client.mine_emoji[1].length);
    mine_emoji = mine_emoji_part.slice(mine_emoji_part.indexOf(`:`)+1, mine_emoji_part.length);
    ore_name = `Nickel Ore`;
    ore_pun = `Cause we all just wanna be big rockstars`
    inventory[1] = parseInt(inventory[1]) + 1;
    inventory_history[1] = parseInt(inventory_history[1]) + 1;
    experience_gained = ((user.premium_status > 0 ? 2 : 1) * (Math.floor(Math.random() * ((nickel_experience_max - nickel_experience_min) + 1) + nickel_experience_min)));
  } else if(random_number_mining < lead_rate){
    mine_emoji_part = client.mine_emoji[2].slice(1, client.mine_emoji[2].length);
    mine_emoji = mine_emoji_part.slice(mine_emoji_part.indexOf(`:`)+1, mine_emoji_part.length);
    ore_name = `Lead Ore`;
    ore_pun = `You can supply the pencil industry for a long time now!`
    inventory[2] = parseInt(inventory[2]) + 1;
    inventory_history[2] = parseInt(inventory_history[2]) + 1;
    experience_gained = ((user.premium_status > 0 ? 2 : 1) * (Math.floor(Math.random() * ((lead_experience_max - lead_experience_min) + 1) + lead_experience_min)));
  } else if(random_number_mining < amethyst_rate){
    mine_emoji_part = client.mine_emoji[3].slice(1, client.mine_emoji[3].length);
    mine_emoji = mine_emoji_part.slice(mine_emoji_part.indexOf(`:`)+1, mine_emoji_part.length);
    ore_name = `Amethyst Geode`;
    ore_pun = `It sparkles in the light and catches everyones attention`
    inventory[3] = parseInt(inventory[3]) + 1;
    inventory_history[3] = parseInt(inventory_history[3]) + 1;
    experience_gained = ((user.premium_status > 0 ? 2 : 1) * (Math.floor(Math.random() * ((amethyst_experience_max - amethyst_experience_min) + 1) + amethyst_experience_min)));
  } else if(random_number_mining < gold_rate){
    mine_emoji_part = client.mine_emoji[4].slice(1, client.mine_emoji[4].length);
    mine_emoji = mine_emoji_part.slice(mine_emoji_part.indexOf(`:`)+1, mine_emoji_part.length);
    ore_name = `Gold Ore`;
    ore_pun = `You struck Gold! Your family is going to be so proud of you`
    inventory[4] = parseInt(inventory[4]) + 1;
    inventory_history[4] = parseInt(inventory_history[4]) + 1;
    experience_gained = ((user.premium_status > 0 ? 2 : 1) * (Math.floor(Math.random() * ((gold_experience_max - gold_experience_min) + 1) + gold_experience_min)));
  } else if(random_number_mining < uranium_rate){
    mine_emoji_part = client.mine_emoji[5].slice(1, client.mine_emoji[5].length);
    mine_emoji = mine_emoji_part.slice(mine_emoji_part.indexOf(`:`)+1, mine_emoji_part.length);
    ore_name = `Uranium Essence`;
    ore_pun = `Do I need to wear some safety gear?`;
    inventory[5] = parseInt(inventory[5]) + 1;
    inventory_history[5] = parseInt(inventory_history[5]) + 1;
    experience_gained = ((user.premium_status > 0 ? 2 : 1) * (Math.floor(Math.random() * ((uranium_experience_max - uranium_experience_min) + 1) + uranium_experience_min)));
  } else {
    message.delete();
    return message.reply(`Something went wrong, please let an Admin know.`);
  }

  let embed_colour = '#' + user.user_colour;
  if(user.user_colour == 'RAND') embed_colour = '#' + Math.floor(Math.random()*16777215).toString(16);
  let embed = new Discord.RichEmbed()
    .setColor(embed_colour);
  if(mined_an_ore){
    // Tell them what fish they caught
    embed.setAuthor(`${message.member.displayName} mined a ${ore_name} (+${experience_gained.format(0)} exp)`, `${mine_emoji == '' ? `${message.author.avatarURL}` : `https://cdn.discordapp.com/emojis/${mine_emoji}.png`}`)
      .setFooter(ore_pun);
    message.channel.send(embed);
  } else {
    // They didnt catch a fish, but they still got experience
    embed.setAuthor(`${message.member.displayName} failed to mine a rock (+${experience_gained.format(0)} exp)`, message.author.avatarURL)
      .setFooter(`Better luck next time`);
    message.channel.send(embed);
  }

  let level_up = false;

  let next_level_requirement = Math.floor(Math.pow(user.experience_mining_level+1, 1.8)*100);
  if(user.experience_mining + experience_gained >= next_level_requirement) level_up = true;

  if(user.experience_mining_level >= ((user.prestige_level+1)*20) && user.prestige_level < 5){
    level_up = false;
    experience_gained = 0;
  }

  let new_level = user.experience_mining_level;
  if(level_up) {
    new_level++;
    let embed_level_up = new Discord.RichEmbed()
      .setColor(embed_colour)
      .setAuthor(`${message.member.displayName} has just reached level ${new_level} in Mining`, message.author.avatarURL)
      .setTimestamp();
    message.channel.send({embed : embed_level_up});
  }

  let sql_update_mining_inventory = `UPDATE users SET experience_mining_level = ${new_level}, experience_mining = ${user.experience_mining + experience_gained}, user_money = ${user.user_money - mining_cost}, list_ore_inventory = '${inventory.join(',')}', list_fish_inventory_history = '${inventory_history.join(',')}', counter_fishing = ${user.counter_fishing + 1}, counter_fish_caught = ${user.counter_fish_caught + (mined_an_ore ? 1 : 0)}, ts_mine = ${now}, counter_money_spent = ${parseFloat(user.counter_money_spent) + mining_cost} WHERE user_discord = ${user.user_discord}`;
  // message.channel.send(sql_update_fish_inventory);
  client.db.run(sql_update_mining_inventory, (err) => {
    if(err) return console.error(`fish.js go_mining() ${err.message}`);
  })

}

const sell_ore = (client, user, message, type) => {
  if(user.user_id != 1){
    message.delete();
    return message.channel.send(`This function is still being worked on. Please try again soon.`).then(msg => msg.delete(5000))
  }
  let inventory = user.list_ore_inventory.split(',');

  let small_price = 1;
  let medium_price = 2;
  let large_price = 3;
  let super_price = 5;
  let legendary_price = 7;
  let magikarp_price = 25;

  let fish_to_sell = false;
  let money_to_add = 0;

  let small_sold = 0;
  let medium_sold = 0;
  let large_sold = 0;
  let super_sold = 0;
  let legendary_sold = 0;
  let magikarp_sold = 0;

  switch(type){
    default:
      break;
    case 'small':
      if(parseInt(inventory[0]) > 0){
        fish_to_sell = true;
        money_to_add = parseInt(inventory[0]) * small_price;
        small_sold += parseInt(inventory[0]);
        inventory[0] = 0;
      }
      break;
    case 'medium':
      if(parseInt(inventory[1]) > 0){
        fish_to_sell = true;
        money_to_add = parseInt(inventory[1]) * medium_price;
        medium_sold += parseInt(inventory[1]);
        inventory[1] = 0;
      }
      break;
    case 'large':
      if(parseInt(inventory[2]) > 0){
        fish_to_sell = true;
        money_to_add = parseInt(inventory[2]) * large_price;
        large_sold += parseInt(inventory[2]);
        inventory[2] = 0;
      }
      break;
    case 'super':
      if(parseInt(inventory[3]) > 0){
        fish_to_sell = true;
        money_to_add = parseInt(inventory[3]) * super_price;
        super_sold += parseInt(inventory[3]);
        inventory[3] = 0;
      }
      break;
    case 'legendary':
      if(parseInt(inventory[4]) > 0){
        fish_to_sell = true;
        money_to_add = parseInt(inventory[4]) * legendary_price;
        legendary_sold += parseInt(inventory[4]);
        inventory[4] = 0;
      }
      break;
    case 'magikarp':
      if(parseInt(inventory[5]) > 0){
        fish_to_sell = true;
        money_to_add = parseInt(inventory[5]) * magikarp_price;
        magikarp_sold += parseInt(inventory[5]);
        inventory[5] = 0;
      }
      break;
    case 'all':
      if(parseInt(inventory[0]) > 0 || parseInt(inventory[1]) > 0 || parseInt(inventory[2]) > 0 || parseInt(inventory[3]) > 0 || parseInt(inventory[4]) > 0 || parseInt(inventory[5]) > 0){
        fish_to_sell = true;
        money_to_add = parseInt(inventory[0]) * small_price;
        money_to_add += parseInt(inventory[1]) * medium_price;
        money_to_add += parseInt(inventory[2]) * large_price;
        money_to_add += parseInt(inventory[3]) * super_price;
        money_to_add += parseInt(inventory[4]) * legendary_price;
        money_to_add += parseInt(inventory[5]) * magikarp_price;
        small_sold += parseInt(inventory[0]);
        medium_sold += parseInt(inventory[1]);
        large_sold += parseInt(inventory[2]);
        super_sold += parseInt(inventory[3]);
        legendary_sold += parseInt(inventory[4]);
        magikarp_sold += parseInt(inventory[5]);
        for(let i=0; i<=5; i++){
          inventory[i] = 0;
        }
      }
      break;
  }

  if(fish_to_sell){
    let embed_colour = '#' + user.user_colour;
    if(user.user_colour == 'RAND') embed_colour = '#' + Math.floor(Math.random()*16777215).toString(16);
    let embed = new Discord.RichEmbed()
      .setColor(embed_colour)
      .setAuthor(`Sale Receipt for ${message.member.displayName}`, message.author.avatarURL)
      .addField(`<${small_fish_emoji}> Small x ${small_sold}`, `\`\`\`${small_sold * small_price}\`\`\``, true)
      .addField(`<${medium_fish_emoji}> Medium x ${medium_sold}`, `\`\`\`${medium_sold * medium_price}\`\`\``, true)
      .addField(`<${large_fish_emoji}> Large x ${large_sold}`, `\`\`\`${large_sold * large_price}\`\`\``, true)
      .addField(`<${super_fish_emoji}> Super x ${super_sold}`, `\`\`\`${super_sold * super_price}\`\`\``, true)
      .addField(`<${legendary_fish_emoji}> Legendary x ${legendary_sold}`, `\`\`\`${legendary_sold * legendary_price}\`\`\``, true)
      .addField(`<${magikarp_fish_emoji}> Magikarp x ${magikarp_sold}`, `\`\`\`${magikarp_sold * magikarp_price}\`\`\``, true)
      .addField(`Total Fish`, `${small_sold + medium_sold + large_sold + super_sold + legendary_sold + magikarp_sold}`, true)
      .addField(`Tokens Gained`, `<${config.fishing_token}> ${money_to_add.format(0)}`, true);
    message.channel.send(embed)

    let sql_sell_fish = `UPDATE users SET list_ore_inventory = '${inventory.join(',')}', gathering_ore = ${user.gathering_ore + money_to_add} WHERE user_discord = ${user.user_discord}`;
    client.db.run(sql_sell_fish, (err) => {
      if(err) return console.error(`fish.js sell_ore() ${err.message}`);
    })
  }

}

const view_inventory = (client, user, message) => {
  let inventory = user.list_ore_inventory.split(',');

  let embed_colour = '#' + user.user_colour;
  if(user.user_colour == 'RAND') embed_colour = '#' + Math.floor(Math.random()*16777215).toString(16);
  let embed = new Discord.RichEmbed()
    .setAuthor(`Mining Inventory of ${message.member.displayName}`, message.author.avatarURL)
    .setColor(embed_colour)
    .addField(`<${client.mine_emoji[0]}> Copper Ore`, `\`\`\`${parseInt(inventory[0]).format(0)}\`\`\``, true)
    .addField(`<${client.mine_emoji[1]}> Nickel Ore`, `\`\`\`${parseInt(inventory[1]).format(0)}\`\`\``, true)
    .addField(`<${client.mine_emoji[2]}> Lead Ore`, `\`\`\`${parseInt(inventory[2]).format(0)}\`\`\``, true)
    .addField(`<${client.mine_emoji[3]}> Amethyst Ore`, `\`\`\`${parseInt(inventory[3]).format(0)}\`\`\``, true)
    .addField(`<${client.mine_emoji[4]}> Gold Ore`, `\`\`\`${parseInt(inventory[4]).format(0)}\`\`\``, true)
    .addField(`<${client.mine_emoji[5]}> Uranium Ore`, `\`\`\`${parseInt(inventory[5]).format(0)}\`\`\``, true)
    .setTimestamp();
  message.channel.send(embed);
}

const view_inventory_history = (client, user, message) => {
  let inventory = user.list_ore_inventory_history.split(',');

  let embed_colour = '#' + user.user_colour;
  if(user.user_colour == 'RAND') embed_colour = '#' + Math.floor(Math.random()*16777215).toString(16);
  let embed = new Discord.RichEmbed()
    .setAuthor(`Mining Inventory (All-Time) of ${message.member.displayName}`, message.author.avatarURL)
    .setColor(embed_colour)
    .addField(`<${client.mine_emoji[0]}> Copper Ore`, `\`\`\`${parseInt(inventory[0]).format(0)}\`\`\``, true)
    .addField(`<${client.mine_emoji[1]}> Nickel Ore`, `\`\`\`${parseInt(inventory[1]).format(0)}\`\`\``, true)
    .addField(`<${client.mine_emoji[2]}> Lead Ore`, `\`\`\`${parseInt(inventory[2]).format(0)}\`\`\``, true)
    .addField(`<${client.mine_emoji[3]}> Amethyst Ore`, `\`\`\`${parseInt(inventory[3]).format(0)}\`\`\``, true)
    .addField(`<${client.mine_emoji[4]}> Gold Ore`, `\`\`\`${parseInt(inventory[4]).format(0)}\`\`\``, true)
    .addField(`<${client.mine_emoji[5]}> Uranium Ore`, `\`\`\`${parseInt(inventory[5]).format(0)}\`\`\``, true)
    .setTimestamp();
  message.channel.send(embed);
}

const fishing_help = (client, user, message) => {
  if(user.user_id != 1){
    message.delete();
    return message.channel.send(`This function is still being worked on. Please try again soon.`).then(msg => msg.delete(5000))
  }
  let embed_colour = '#' + user.user_colour;
  if(user.user_colour == 'RAND') embed_colour = '#' + Math.floor(Math.random()*16777215).toString(16);

  let command_array = [];
  command_array.push(`**=fish** - Go Fishing. *Aliases: =fish fish, =fish catch* ***COST: 200***`);
  command_array.push(`**=fish inventory** - Display all your current fish. *Aliases: =fish inv*`);
  command_array.push(`**=fish history** - Display all the fish you have caught. *Aliases: =fish all, =fish hist*`);
  command_array.push(`**=fish sell <options>** - Turn all your current fish into Fishing Tokens **Do *=fish sell* to view options and prices**`);

  let embed = new Discord.RichEmbed()
    .setColor(embed_colour)
    .setAuthor(`Fishing Help - General`, message.author.avatarURL)

    .setTitle(`Current Commands`)

    .addField(`${config.prefix}fish`, `\`\`\`Catch a fish for $200\`\`\``)
    .addField(`${config.prefix}fish inventory`, `\`\`\`Display all your current fish\`\`\``)
    .addField(`${config.prefix}fish history`, `\`\`\`Display all fish youve caught\`\`\``)
    .addField(`${config.prefix}fish sell`, `\`\`\`Display the help menu for selling\`\`\``)
    .addField(`${config.prefix}fish sell <options>`, `\`\`\`Turn all your fish into Fishing Tokens\`\`\` \`\`\`Options: 'all', 'small', 'medium', 'large', 'super', 'legendary', 'magikarp'\`\`\``);

  message.channel.send(embed)
}

const fishing_sell_help = (client, user, message) => {
  if(user.user_id != 1){
    message.delete();
    return message.channel.send(`This function is still being worked on. Please try again soon.`).then(msg => msg.delete(5000))
  }
  let embed_colour = '#' + user.user_colour;
  if(user.user_colour == 'RAND') embed_colour = '#' + Math.floor(Math.random()*16777215).toString(16);

  let small_fish_emoji = `:SmallFish:517449760349618206`;
  let medium_fish_emoji = `:MediumFish:517449758940332053`;
  let large_fish_emoji = `:LargeFish:517449759372607507`;
  let super_fish_emoji = `:SuperFish:517449759963873302`;
  let legendary_fish_emoji = `:LegendaryFish:517449759313887283`;
  let magikarp_fish_emoji = `:Magikarp:517449753970212875`;

  let embed = new Discord.RichEmbed()
    .setColor(embed_colour)
    .setAuthor(`Fishing Help - Selling`, message.author.avatarURL)

    .addField(`<${small_fish_emoji}> Small Fish`, `\`\`\`1\`\`\``, true)
    .addField(`<${medium_fish_emoji}> Medium Fish`, `\`\`\`2\`\`\``, true)
    .addField(`<${large_fish_emoji}> Large Fish`, `\`\`\`3\`\`\``, true)
    .addField(`<${super_fish_emoji}> Super Fish`, `\`\`\`5\`\`\``, true)
    .addField(`<${legendary_fish_emoji}> Legendary Fish`, `\`\`\`7\`\`\``, true)
    .addField(`<${magikarp_fish_emoji}> Magikarp`, `\`\`\`25\`\`\``, true)
    .addField(`Sell Command`, `\`\`\`=fish sell <options> \nOptions: 'all', 'small', 'medium', 'large', 'super', 'legendary', 'magikarp'\`\`\``)
    .setFooter(`All prices are how many FIshing Tokens you will receive`);
  message.channel.send(embed);
}


exports.run = function(client, message, args, user, guild){
  if(!user) return message.reply(`Please start your profile in <#${guild.channel_setup}>`)
  if(!guild) return message.reply(`Please tell an admin to re-invite the bot to the server.`)

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

  let fishing_time_display = (now - (parseInt(user.ts_mine) + (minute_millis * 5))) * -1;
  let fishing_minutes = ``;
  let fishing_seconds = ``;
  let fishing_timer = ``;

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

  if(!args[0]){ // =mine
    if(now - user.ts_mine < 5 * 60 * 1000
    && user.user_id != 1
    ) {
      message.delete();
      return message.reply(`Please wait another **${fishing_timer}** before going mining again.`).then(msg => msg.delete(5000));
    } else {
      go_mining(client, user, message);
    }
  } else {
    switch(args[0].toLowerCase()){ // =fish <args[0]>
      default:
      case `fish`:
      case `catch`:
      if(now - user.ts_mine < 5 * 60 * 1000) {
        message.delete();
        return message.reply(`Please wait another **${fishing_timer}** before going mining again.`).then(msg => msg.delete(5000));
      } else {
        go_mining(client, user, message);
      }
        break;

      case `sell`:
        if(!args[1]){ // =fish sell
            fishing_sell_help(client, user, message);
        } else { // =fish sell <args[1]>
          switch(args[1].toLowerCase()){
            default:
              fishing_sell_help(client, user, message);
              break;
            case `small`:
            case `medium`:
            case `large`:
            case `super`:
            case `legendary`:
            case `magikarp`: // =fish sell magikarp
            case `all`: // =fish sell all
              sell_ore(client, user, message, args[1].toLowerCase());
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
      case `all`:
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

  if(now - user.ts_commands > 60 * 1000){
    let sql_update_command_counter = `UPDATE users SET counter_commands = ${user.counter_commands+1}, ts_commands = ${now} WHERE user_discord = ${user.user_discord}`;
    client.db.run(sql_update_command_counter, (err) => {
      if(err) return console.error(`profile.js sql_update_command_counter ${err.message}`);
    })
  }

};

exports.conf = {
  aliases: [],
  permLevel: 0
};

exports.help = {
  name: "mine",
  description: "Starts mining",
  usage: "mine"
}
