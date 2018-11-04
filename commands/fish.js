const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);

const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./utils/users.db', sqlite3.OPEN_READWRITE, (err) => {
  if(err){
    console.error(err.message);
  }
  console.log(`Connected to DB - Start`);
});

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
  });
}

exports.run = function(client, message, args){
  let small_fish_icon = `<:SmallFish:507593596887629824>`;
  let medium_fish_icon = `<:MediumFish:507593596728508426>`;
  let large_fish_icon = `<:LargeFish:507593595684126720>`;
  let super_fish_icon = `<:SuperFish:507593597361586196>`;
  let legendary_fish_icon = `<:LegendaryFish:507593595549908992>`;
  let magikarp_icon = `<:magikarp:507005931503222784>`;

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

    if(!args[0]){
      // Go fishing
      if(now - parseInt(row.lastfish) < 7 * 60 * 1000){
         message.delete();
         let tFormat = "";
         let tDiff = Math.floor(420 - (now - parseInt(row.lastfish))); // 295
         let tDiffMins = Math.floor((tDiff / 60)*1000);
         if(tDiffMins >= 2) {
           tFormat = tDiffMins + " minutes";
         } else if(tDiffMins == 1) {
           tFormat = tDiffMins + " minute";
         }
         let tDiffSecs = tDiff - (tDiffMins * 60*1000);
         if(tDiffSecs >= 2) {
           tFormat += " " + tDiffSecs + " seconds";
         } else if(tDiffSecs == 1){
           tFormat += " " + tDiffSecs + " second";
         }
         return message.reply(`Please wait another **${tFormat}** before trying to fish again.`);
       }

      let chance_fail = 47;
      let chance_small = 30 + chance_fail;
      let chance_medium = 13 + chance_small;
      let chance_large = 9 + chance_medium;
      let chance_super = 1 + chance_large;

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
        embed.addField(`\u200b`, `${small_fish_icon}`);
        embed.setFooter(`You feel a small bit of tension from your rod. You reel it in and find a Small Fish`);
        sizeCatch = "small";
      } else if(random < chance_medium) {
        // Catch Medium
        embed.setColor('#63cccc');
        embed.addField(`\u200b`, `${medium_fish_icon}`);
        embed.setFooter(`After a small bit of fighting, you eventually pull in a Medium Fish`);
        sizeCatch = "medium";
      } else if(random < chance_large) {
        // Catch Large
        embed.setColor('#63cccc');
        embed.addField(`\u200b`, `${large_fish_icon}`);
        embed.setFooter(`Your arm nearly snapped in two trying to pull in this Large Fish!`);
        sizeCatch = "large";
      } else {
        let superRole = Math.floor(Math.random() * 500);
        if(superRole <= chance_legendary) {
          // Catch Legendary
          embed.setColor('#dee067');
          embed.addField(`\u200b`, `${legendary_fish_icon}`);
          embed.setFooter(`People have talked about this beast for years, but never did you think you would actually find it! You just got a Legendary Fish!`);
          sizeCatch = "legendary";
        } else if(superRole == chance_magikarp){
          // Catch Magikarp
          embed.setColor('#e8a517');
          embed.addField(`\u200b`, `${magikarp_icon}`);
          embed.setFooter(`This cant be right? You just found a Magikarp`);
          sizeCatch = "magikarp";
        } else {
          // Catch Super
          embed.setColor('#16b3e8');
          embed.addField(`\u200b`, `${super_fish_icon}`);
          embed.setFooter(`Is it a bird? Is it a plane? I sure hope not, its in the water. Must be a Super Fish!`);
          sizeCatch = "super";
        }
      }
      message.channel.send(embed);
      catch_fish(sizeCatch, message, row, fishingCost, client);

    } else if(args[0] == "inventory" || args[0] == "inv"){
      // Show your inventory

      let inventory_display = "";
      inventory_display += `${small_fish_icon} x ${small_fish_count}\n`;
      inventory_display += `${medium_fish_icon} x ${medium_fish_count}\n`
      inventory_display += `${large_fish_icon} x ${large_fish_count}\n`
      inventory_display += `${super_fish_icon} x ${super_fish_count}\n`
      inventory_display += `${legendary_fish_icon} x ${legendary_fish_count}\n`
      inventory_display += `${magikarp_icon} x ${magikarp_count}`

      let embed = new Discord.RichEmbed()
        .setColor('#7f8a9d')
        .setTitle(`Fishing Inventory of ${message.guild.member(message.author.id).user.username}#${message.guild.members.get(message.author.id).user.discriminator}`)
        .setThumbnail(`${message.author.avatarURL}`)
        .addField(`Inventory`, `${inventory_display}`)
        .setFooter(`Fishing minigame is coming soon!`);
      message.channel.send(embed);

    } else if(args[0] == "history" || args[0] == "alltime"){
      // Show your inventory history

      let inventory_history_display = "";
      inventory_history_display += `${small_fish_icon} x ${small_fish_count_history}\n`;
      inventory_history_display += `${medium_fish_icon} x ${medium_fish_count_history}\n`
      inventory_history_display += `${large_fish_icon} x ${large_fish_count_history}\n`
      inventory_history_display += `${super_fish_icon} x ${super_fish_count_history}\n`
      inventory_history_display += `${legendary_fish_icon} x ${legendary_fish_count_history}\n`
      inventory_history_display += `${magikarp_icon} x ${magikarp_count_history}`

      let embed = new Discord.RichEmbed()
        .setColor('#7f8a9d')
        .setTitle(`Fishing History of ${message.guild.member(message.author.id).user.username}#${message.guild.members.get(message.author.id).user.discriminator}`)
        .setThumbnail(`${message.author.avatarURL}`)
        .addField(`Inventory`, `${inventory_history_display}`)
        .setFooter(`Fishing minigame is coming soon!`);
      message.channel.send(embed);

    } else if(args[0] == "sell"){
      if(!args[1]){
        // Let them know the correct format
      } else {
        switch(args[1]){
          case "all":
            // Sell all fish
            break;
          case "small":
            // Sell all small fish
            break;
          case "medium":
            // Sell all medium fish
            break;
          case "large":
            // Sell all large fish
            break;
          case "super":
            // Sell all super fish
            break;
          case "legendary":
            // Sell all legendary fish
            break;
          case "magikarp":
            // Sell all magikarp
            break;
          default:
            // Let them know the correct format
            break;
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
