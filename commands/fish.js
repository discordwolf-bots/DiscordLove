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
  message.delete();
  let sql = `SELECT * FROM users WHERE user_discord = ${message.author.id}`;
  db.get(sql, [], (err, row) => {
    if(err) return console.error(err.message);
    if(!row) return message.reply(`You do not have a profile yet!`);

  });
};

exports.conf = {
  aliases: [],
  permLevel: 4
};

exports.help = {
  name: "fish",
  description: "Fishing minigame",
  usage: "fish"
}
