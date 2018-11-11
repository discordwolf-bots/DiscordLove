const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);

const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./utils/users.db', sqlite3.OPEN_READWRITE, (err) => {
  if(err){
    console.error(err.message);
  }
  console.log(`Connected to DB - Fishing`);
});

Number.prototype.format = function(n, x) {
  var re = '(\\d)(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
  return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$1,');
};

const achieve_catching = (message, client, row) => {
  let gone_fishing_progress = row.achieve_go_fishing;
  let fish_caught = row.goneFishing+1;
  let achieved = 0;

  for(let i=0; i<config.thresh_catch_a_fish.length; i++){
    if(fish_caught >= parseInt(config.thresh_catch_a_fish.split(',')[i]))
      if(gone_fishing_progress < i+1)
        achieved = i+1;
  }

  if(achieved > 0){
    let rewards = 0;
    for(let i=gone_fishing_progress;i<=achieved;i++){
      for(let j=1; j<=config.thresh_catch_a_fish.length; j++){
        if(i == j) rewards += parseInt(config.rewards.split(',')[j-1]);
      }
    }
    let embed = new Discord.RichEmbed()
      .setColor('#4DBF42')
      .setAuthor(`Achievement Gained! - \$${rewards.format(0)} added!`, message.author.avatarURL)
      .setFooter(`Gained ${achieved-gone_fishing_progress} Levels on the Gone Fishing achievement`);
    message.channel.send(embed);
    let newBalance = row.money + rewards - 25;
    client.channels.get(config.logging).send(`:fish: ACHIEVEMENT GONE FISHING : ${message.author.username}#${message.author.discriminator} - ${row.money} -> ${newBalance}`);
    let sqlUpdate = `UPDATE users SET money = ${newBalance}, achieve_go_fishing = ${achieved} WHERE id = ${message.author.id}`;
    db.run(sqlUpdate, (err) => {
      if(err) return console.error(err.message);
    });
  }
}

const achieve_fish_seller = (message, client, row, sale, soldTotal) => {
  let gone_fishing_progress = row.achieve_fishmonger;
  let fish_caught = row.soldFish + soldTotal;
  let achieved = 0;

  for(let i=0; i<config.thresh_sell_a_fish.length; i++){
    if(fish_caught >= parseInt(config.thresh_sell_a_fish.split(',')[i]))
      if(gone_fishing_progress < i+1)
        achieved = i+1;
  }
  if(achieved > 0){
    let rewards = 0;
    for(let i=gone_fishing_progress;i<=achieved;i++){
      for(let j=1; j<=config.thresh_sell_a_fish.length; j++){
        if(i == j) rewards += parseInt(config.rewards.split(',')[j-1]);
      }
    }
    let embed = new Discord.RichEmbed()
      .setColor('#4DBF42')
      .setAuthor(`Achievement Gained! - \$${rewards.format(0)} added!`, message.author.avatarURL)
      .setFooter(`Gained ${achieved-gone_fishing_progress} Levels on the Fishmonger achievement`);
    message.channel.send(embed);
    let newBalance = row.money + rewards + sale;
    client.channels.get(config.logging).send(`:fish: ACHIEVEMENT FISHMONGER : ${message.author.username}#${message.author.discriminator} - ${row.money} -> ${newBalance}`);
    let sqlUpdate = `UPDATE users SET money = ${newBalance}, achieve_fishmonger = ${achieved} WHERE id = ${message.author.id}`;
    db.run(sqlUpdate, (err) => {
      if(err) return console.error(err.message);
    });
  }
}

const catch_fish = (size, message, row, fishingCost, client) => {
  let now = moment().format('x');
  let inventoryHistory = row.fishInventoryHistory.split(',');
  let inventory = row.fishInventory.split(',');
  let newFishCaught = row.goneFishing;
  let newFishCounter = row.goneFishing + 1;
  let magikarp = row.magikarpCaught;
  let magikarp_achieve = row.achieve_catch_a_karp;
  if(size == "small") {
    inventory[0] = parseInt(inventory[0])+1;
    inventoryHistory[0] = parseInt(inventoryHistory[0])+1;
    newFishCaught = row.goneFishing+1;
  }
  if(size == "medium") {
    inventory[1] = parseInt(inventory[1])+1;
    inventoryHistory[1] = parseInt(inventoryHistory[1])+1;
    newFishCaught = row.goneFishing+1;
  }
  if(size == "large") {
    inventory[2] = parseInt(inventory[2])+1;
    inventoryHistory[2] = parseInt(inventoryHistory[2])+1;
    newFishCaught = row.goneFishing+1;
  }
  if(size == "super") {
    inventory[3] = parseInt(inventory[3])+1;
    inventoryHistory[3] = parseInt(inventoryHistory[3])+1;
    newFishCaught = row.goneFishing+1;
  }
  if(size == "legendary") {
    inventory[4] = parseInt(inventory[4])+1;
    inventoryHistory[4] = parseInt(inventoryHistory[4])+1;
    newFishCaught = row.goneFishing+1;
  }
  if(size == "magikarp") {
    inventory[5] = parseInt(inventory[5])+1;
    inventoryHistory[5] = parseInt(inventoryHistory[5])+1;
    newFishCaught = row.goneFishing+1;
    magikarp++;
    if(magikarp_achieve == 0) {
      magikarp_achieve = 1;
    }
  }
  let newInventory = inventory.join(',');
  let newInventoryHistory = inventoryHistory.join(',');

  let sql = `UPDATE users SET money = ${row.money-25}, goneFishing = ${newFishCaught}, fishInventory = '${newInventory}', fishInventoryHistory = '${newInventoryHistory}', magikarpCaught = ${magikarp}, achieve_catch_a_karp = ${magikarp_achieve}, lastfish = ${now} WHERE id = ${message.author.id}`;
  db.run(sql, (err) => {
    if(err) console.error(err.message);
    achieve_catching(message, client, row);
  });
}

exports.run = function(client, message, args){
  let small_fish_icon = `507593596887629824`;
  let medium_fish_icon = `507593596728508426`;
  let large_fish_icon = `507593595684126720`;
  let super_fish_icon = `507593597361586196`;
  let legendary_fish_icon = `507593595549908992`;
  let magikarp_icon = `507005931503222784`;

  let small_fish_emoji = `<:SmallFish:507593596887629824>`;
  let medium_fish_emoji = `<:MediumFish:507593596728508426>`;
  let large_fish_emoji = `<:LargeFish:507593595684126720>`;
  let super_fish_emoji = `<:SuperFish:507593597361586196>`;
  let legendary_fish_emoji = `<:LegendaryFish:507593595549908992>`;
  let magikarp_emoji = `<:magikarp:507005931503222784>`;

  let sql = `SELECT * FROM users WHERE id = ${message.author.id}`;
  db.get(sql, (err, row) => {
    let now = moment().format('x');
    let fishingCost = 25;
    if(err) return console.error(err.message);
    if(!row) return message.reply(`You need to start your profile first with **${config.prefix}start**`);
    if(row.money < fishingCost) return message.reply(`You do not have enough money to fish! You need **${fishingCost.format(0)}**, you have **${row.money.format(0)}**`);

    let inventory = row.fishInventory.split(',');
    let small_fish_count = parseInt(inventory[0]);
    let medium_fish_count = parseInt(inventory[1]);
    let large_fish_count = parseInt(inventory[2]);
    let super_fish_count = parseInt(inventory[3]);
    let legendary_fish_count = parseInt(inventory[4]);
    let magikarp_count = parseInt(inventory[5]);

    let inventoryHistory = row.fishInventoryHistory.split(',');
    let small_fish_count_history = parseInt(inventoryHistory[0]);
    let medium_fish_count_history = parseInt(inventoryHistory[1]);
    let large_fish_count_history = parseInt(inventoryHistory[2]);
    let super_fish_count_history = parseInt(inventoryHistory[3]);
    let legendary_fish_count_history = parseInt(inventoryHistory[4]);
    let magikarp_count_history = parseInt(inventoryHistory[5]);

    let inventory_history_total = small_fish_count_history + medium_fish_count_history + large_fish_count_history + super_fish_count_history + legendary_fish_count_history + magikarp_count_history;
    let inventory_total = small_fish_count + medium_fish_count + large_fish_count + super_fish_count + legendary_fish_count + magikarp_count;

    if(!args[0]){
      // Go fishing
      if(now - parseInt(row.lastfish) < 5 * 60 * 1000){
         message.delete();
         let tFormat = "";

         let tDiff = Math.floor((5 * 60 * 1000) - ((now - parseInt(row.lastfish))));
         tDiff /= 1000;
         let tDiffMins = Math.floor((tDiff / 60));
         if(tDiffMins >= 2) {
           tFormat = tDiffMins + " minutes";
         } else if(tDiffMins == 1) {
           tFormat = tDiffMins + " minute";
         }
         let tDiffSecs = Math.floor(tDiff - (tDiffMins * 60));
         if(tDiffSecs >= 2) {
           tFormat += " " + tDiffSecs + " seconds";
         } else if(tDiffSecs == 1){
           tFormat += " " + tDiffSecs + " second";
         }

         return message.reply(`Please wait another **${tFormat}** before trying to fish again.`);
       }

      let chance_fail = 25;
      let chance_small = 35 + chance_fail;
      let chance_medium = 25 + chance_small;
      let chance_large = 13 + chance_medium;
      let chance_super = 2 + chance_large;

      // Legendary and Magikarp are on a seperate role (initiated when catching a super)
      let chance_legendary = 50;
      let chance_magikarp = 500;

      let min = 0;
      let max = chance_super;
      let random = Math.floor(Math.random() * (max-min)) + min;

      let embed = new Discord.RichEmbed()
        .setAuthor(`Fishing Results - ${message.author.username}#${message.author.discriminator}`, message.author.avatarURL);

      let sizeCatch = "";
      if(random < chance_fail){
        // Failed
        embed.setColor('#000000');
        embed.setFooter(`You cast out your hook and found nothing!`);
        sizeCatch = "fail";
      } else if(random < chance_small) {
        // Catch Small
        embed.setColor('#63cccc');
        embed.setImage(`https://cdn.discordapp.com/emojis/${small_fish_icon}.png`);
        embed.setFooter(`Oh there was something there, guess it was just a Small Fish.`);
        sizeCatch = "small";
      } else if(random < chance_medium) {
        // Catch Medium
        embed.setColor('#63cccc');
        embed.setImage(`https://cdn.discordapp.com/emojis/${medium_fish_icon}.png`);
        embed.setFooter(`It nearly got away from you, but you just caught a Medium Fish.`);
        sizeCatch = "medium";
      } else if(random < chance_large) {
        // Catch Large
        embed.setColor('#63cccc');
        embed.setImage(`https://cdn.discordapp.com/emojis/${large_fish_icon}.png`);
        embed.setFooter(`Is that Matt in fish form? Oh, it must be a Large Fish.`);
        sizeCatch = "large";
      } else {
        let superRole = Math.floor(Math.random() * 500);
        if(superRole <= chance_legendary) {
          // Catch Legendary
          embed.setColor('#dee067');
          embed.setImage(`https://cdn.discordapp.com/emojis/${legendary_fish_icon}.png`);
          embed.setFooter(`People have talked about this beast for years, but never did you think you would actually find it! You just got a Legendary Fish!`);
          sizeCatch = "legendary";
        } else if(superRole == chance_magikarp){
          // Catch Magikarp
          embed.setColor('#e8a517');
          embed.setImage(`https://cdn.discordapp.com/emojis/${magikarp_icon}.png`);
          embed.setFooter(`This cant be right? You just found a Magikarp`);
          sizeCatch = "magikarp";
        } else {
          // Catch Super
          embed.setColor('#16b3e8');
          embed.setImage(`https://cdn.discordapp.com/emojis/${super_fish_icon}.png`);
          embed.setFooter(`Is it a bird? Is it a plane? I sure hope not, its in the water. Must be a Super Fish!`);
          sizeCatch = "super";
        }
      }
      message.channel.send(embed);
      catch_fish(sizeCatch, message, row, fishingCost, client);

    } else if(args[0] == "help"){
      // Show the fishing help meny
      let embed = new Discord.RichEmbed()
        .setColor(`#87a61f`)
        .setTitle(`Fishing help`)
        .addField(`Commands`, `${config.prefix}fish - Go fishing!\n${config.prefix}fish inv - See your inventory\n${config.prefix}fish alltime - Shows all fish youve ever caught\n${config.prefix}fish sell <all | *size*> - Sell fish from your inventory (all sells everything, or specify a size)`)
        .addField(`Probabilities`, `${small_fish_emoji} *(small)* : **35%**\n${medium_fish_emoji} *(medium)* : **25%**\n${large_fish_emoji} *(large)* : **13%**\n${super_fish_emoji} *(super)* : **1.796%**\n${legendary_fish_emoji} *(legendary)* : **0.2%**\n${magikarp_emoji} *(magikarp)* : **0.004%**`)
        .addField(`Sell prices`, `${small_fish_emoji} *(small)* : **15**\n${medium_fish_emoji} *(medium)* : **25**\n${large_fish_emoji} *(large)* : **50**\n${super_fish_emoji} *(super)* : **375**\n${legendary_fish_emoji} *(legendary)* : **3,500**\n${magikarp_emoji} *(magikarp)* : **200,000**`);
      message.channel.send(embed);
    } else if(args[0] == "inventory" || args[0] == "inv"){
      // Show your inventory

      let inventory_display = "";
      inventory_display += `${small_fish_emoji} *(small)* x ${small_fish_count}\n`;
      inventory_display += `${medium_fish_emoji} *(medium)* x ${medium_fish_count}\n`
      inventory_display += `${large_fish_emoji} *(large)* x ${large_fish_count}\n`
      inventory_display += `${super_fish_emoji} *(super)* x ${super_fish_count}\n`
      inventory_display += `${legendary_fish_emoji} *(legendary)* x ${legendary_fish_count}\n`
      inventory_display += `${magikarp_emoji} *(magikarp)* x ${magikarp_count}`

      let embed = new Discord.RichEmbed()
        .setColor('#7f8a9d')
        .setTitle(`Fishing Inventory of ${message.guild.member(message.author.id).user.username}#${message.guild.members.get(message.author.id).user.discriminator}`)
        .setThumbnail(`${message.author.avatarURL}`)
        .addField(`Inventory`, `${inventory_display}`)
        .setTimestamp();
      message.channel.send(embed);

    } else if(args[0] == "history" || args[0] == "alltime"){
      // Show your inventory history

      let inventory_history_display = "";
      inventory_history_display += `${small_fish_emoji} *(small)* x ${small_fish_count_history}\n`;
      inventory_history_display += `${medium_fish_emoji} *(medium)* x ${medium_fish_count_history}\n`;
      inventory_history_display += `${large_fish_emoji} *(large)* x ${large_fish_count_history}\n`;
      inventory_history_display += `${super_fish_emoji} *(super)* x ${super_fish_count_history}\n`;
      inventory_history_display += `${legendary_fish_emoji} *(legendary)* x ${legendary_fish_count_history}\n`;
      inventory_history_display += `${magikarp_emoji} *(magikarp)* x ${magikarp_count_history}`;




      let embed = new Discord.RichEmbed()
        .setColor('#7f8a9d')
        .setTitle(`Fishing History of ${message.guild.member(message.author.id).user.username}#${message.guild.members.get(message.author.id).user.discriminator}`)
        .setThumbnail(`${message.author.avatarURL}`)
        .addField(`Inventory`, `${inventory_history_display}`)
        .setFooter(`Fishing minigame is coming soon!`);
      message.channel.send(embed);

    } else if(args[0] == "sell"){
      let small_fish_cost = 15;
      let medium_fish_cost = 25;
      let large_fish_cost = 50;
      let super_fish_cost = 375;
      let legendary_fish_cost = 3500;
      let magikarp_cost = 200000;
      if(!args[1]){
        // Let them know the correct format
        return message.reply(`Please use the correct format. **${config.prefix}fish sell <all | size>** (eg. ${config.prefix}fish sell medium)`);
      } else {
        let sellPrice = 0;
        let soldTotal = 0;
        let soldInventory = "";
        switch(args[1]){
          case "all":
            // Sell all fish
            if(small_fish_count > 0 || medium_fish_count > 0 || large_fish_count > 0 || super_fish_count > 0 || legendary_fish_count > 0 || magikarp_count > 0){
              soldTotal += small_fish_count;
              soldTotal += medium_fish_count;
              soldTotal += large_fish_count;
              soldTotal += super_fish_count;
              soldTotal += legendary_fish_count;
              soldTotal += magikarp_count;

              sellPrice += small_fish_count * small_fish_cost;
              sellPrice += medium_fish_count * medium_fish_cost;
              sellPrice += large_fish_count * large_fish_cost;
              sellPrice += super_fish_count * super_fish_cost;
              sellPrice += legendary_fish_count * legendary_fish_cost;
              sellPrice += magikarp_count * magikarp_cost;
              soldInventory = "0,0,0,0,0,0";
            } else {
              message.reply(`You dont have any fish you can sell.`)
            }
            break;
          case "small":
            // Sell all small fish
            if(small_fish_count > 0){
              sellPrice += small_fish_count * small_fish_cost;
              soldTotal += small_fish_count;
              soldInventory = `0,${inventory[1]},${inventory[2]},${inventory[3]},${inventory[4]},${inventory[5]}`;
            } else {
              message.reply(`You dont have any Small Fish you can sell.`)
            }
            break;
          case "medium":
            // Sell all medium fish
            if(medium_fish_count > 0){
              sellPrice += medium_fish_count * medium_fish_cost;
              soldTotal += medium_fish_count;
              soldInventory = `${inventory[0]},0,${inventory[2]},${inventory[3]},${inventory[4]},${inventory[5]}`;
            } else {
              message.reply(`You dont have any Medium Fish you can sell.`)
            }
            break;
          case "large":
            // Sell all large fish
            if(large_fish_count > 0){
              sellPrice += large_fish_count * large_fish_cost;
              soldTotal += large_fish_count;
              soldInventory = `${inventory[0]},${inventory[1]},0,${inventory[3]},${inventory[4]},${inventory[5]}`;
            } else {
              message.reply(`You dont have any Large Fish you can sell.`)
            }
            break;
          case "super":
            // Sell all super fish
            if(super_fish_count > 0){
              sellPrice += super_fish_count * super_fish_cost;
              soldTotal += super_fish_count;
              soldInventory = `${inventory[0]},${inventory[1]},${inventory[2]},0,${inventory[4]},${inventory[5]}`;
            } else {
              message.reply(`You dont have any Super Fish you can sell.`)
            }
            break;
          case "legendary":
            // Sell all legendary fish
            if(legendary_fish_count > 0){
              sellPrice += legendary_fish_count * legendary_fish_cost;
              soldTotal += legendary_fish_count;
              soldInventory = `${inventory[0]},${inventory[1]},${inventory[2]},${inventory[3]},0,${inventory[5]}`;
            } else {
              message.reply(`You dont have any Legendary Fish you can sell.`)
            }
            break;
          case "magikarp":
            // Sell all magikarp
            if(magikarp_count > 0){
              sellPrice += magikarp_count * magikarp_cost;
              soldTotal += magikarp_count;
              soldInventory = `${inventory[0]},${inventory[1]},${inventory[2]},${inventory[3]},${inventory[4]},0`;
            } else {
              message.reply(`You dont have any Magikarp you can sell.`)
            }
            break;
          default:
            // Let them know the correct format
            break;
        }
        if(sellPrice > 0){
          let newBalance = row.money + sellPrice;
          let sql2 = "";
          if(row.soldFish != (inventory_history_total - inventory_total)){
            sql2 = `UPDATE users SET money = ${newBalance}, soldFish = ${(inventory_history_total-inventory_total) + soldTotal}, fishInventory = '${soldInventory}' WHERE id = ${message.author.id}`;
          } else {
            sql2 = `UPDATE users SET money = ${newBalance}, soldFish = ${row.soldFish + soldTotal}, fishInventory = '${soldInventory}' WHERE id = ${message.author.id}`;
          }
          db.run(sql2, (err) => {
            if(err) console.error(err.message);
            message.reply(`Sale successful! You have gained **\$${sellPrice.format(0)}** from selling **${soldTotal}** fish`);
            client.channels.get(config.logging).send(`:fish: FISHING SALE : ${message.guild.member(message.author.id).user.username}#${message.guild.members.get(message.author.id).user.discriminator} - ${row.money} -> ${newBalance}`);
            achieve_fish_seller(message, client, row, sellPrice, soldTotal);
          });
        }
      }
    }

  });
}

exports.conf = {
  aliases: [],
  permLevel: 0
};

exports.help = {
  name: "fish",
  description: "Fishing minigame",
  usage: "fish"
}
