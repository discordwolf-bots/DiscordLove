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
  if(!args[0]){
    // Go fishing
  } else if(args[0] == "inventory" || args[0] == "inv"){
    // Show your inventory
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
