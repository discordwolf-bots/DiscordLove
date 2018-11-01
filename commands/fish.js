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
          case "shiny":
            // Sell all shiny fish
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
