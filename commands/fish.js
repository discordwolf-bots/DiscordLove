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

exports.run = function(client, message, args){
  let small_fish_icon = `<:SmallFish:507593596887629824>`;
  let medium_fish_icon = `<:MediumFish:507593596728508426>`;
  let large_fish_icon = `<:LargeFish:507593595684126720>`;
  let super_fish_icon = `<:SuperFish:507593597361586196>`;
  let legendary_fish_icon = `<:LegendaryFish:507593595549908992>`;
  let magikarp_icon = `<:magikarp:507005931503222784>`;

  let sql = `SELECT * FROM users WHERE id = ${message.author.id}`;
  db.get(sql, (err, row) => {
    if(err) return console.error(err.message);
    if(!row) return message.reply(`You need to start your profile first with **${config.prefix}start**`);

    let inventory = row.fishInventory.split(',');
    let small_fish_count = parseInt(inventory[0]);
    let medium_fish_count = parseInt(inventory[1]);
    let large_fish_count = parseInt(inventory[2]);
    let super_fish_count = parseInt(inventory[3]);
    let legendary_fish_count = parseInt(inventory[4]);
    let magikarp_count = parseInt(inventory[5]);

    if(!args[0]){
      // Go fishing
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

      if(random < chance_fail){
        // Failed
        embed.setColor('#000000');
        embed.setFooter(`You cast out your hook and found nothing!`);
      } else if(random < chance_small) {
        // Catch Small
        embed.setColor('#63cccc');
        embed.addField(`\u0020`, `${small_fish_icon}`);
        embed.setFooter(`You feel a small bit of tension from your rod. You reel it in and find a Small Fish`);
      } else if(random < chance_medium) {
        // Catch Medium
        embed.setColor('#63cccc');
        embed.addField(`\u0020`, `${medium_fish_icon}`);
        embed.setFooter(`After a small bit of fighting, you eventually pull in a Medium Fish`);
      } else if(random < chance_large) {
        // Catch Large
        embed.setColor('#63cccc');
        embed.addField(`\u0020`, `${large_fish_icon}`);
        embed.setFooter(`Your arm nearly snapped in two trying to pull in this Large Fish!`);
      } else {
        let superRole = Math.floor(Math.random() * 500);
        if(superRole <= chance_legendary) {
          // Catch Legendary
          embed.setColor('#dee067');
          embed.addField(`\u0020`, `${legendary_fish_icon}`);
          embed.setFooter(`People have talked about this beast for years, but never did you think you would actually find it! You just got a Legendary Fish!`);
        } else if(superRole == chance_magikarp){
          // Catch Magikarp
          embed.setColor('#e8a517');
          embed.addField(`\u0020`, `${magikarp_icon}`);
          embed.setFooter(`This cant be right? You just found a Magikarp`);
        } else {
          // Catch Super
          embed.setColor('#16b3e8');
          embed.addField(`\u0020`, `${super_fish_icon}`);
          embed.setFooter(`Is it a bird? Is it a plane? I sure hope not, its in the water. Must be a Super Fish!`);
        }
      }
      message.channel.send(embed);

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
  permLevel: 4
};

exports.help = {
  name: "fish",
  description: "Fishing minigame",
  usage: "fish"
}
