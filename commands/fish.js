const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);

const go_fishing = (user, message) => {

}

const sell_fish = (user, message, type) => {

}

const view_inventory = (user, message) => {

}

const view_inventory_history = (user, message) => {

}

const fishing_help = (user, message) => {

}

const fishing_sell_help = (user, message) => {
  
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

      message.delete();

      if(!args[0]){ // =fish
        go_fishing(user, message);
      } else {
        switch(args[0].toLowerCase()){ // =fish <args[0]>
          default:
          case `fish`:
          case `catch`:
            go_fishing(user, message);
            break;

          case `sell`:
            if(!args[1]){ // =fish sell
                fishing_sell_help(user, message);
            } else { // =fish sell <args[1]>
              switch(args[1].toLowerCase()){
                default:
                  break;
                case `small`:
                case `medium`:
                case `large`:
                case `super`:
                case `legendary`:
                case `magikarp`:
                case `all`:
                  sell_fish(user, message, args[1].toLowerCase());
                  break;
              }
            }
            break;

          case `inventory`:
          case `invent`:
          case `inv`:
            view_inventory(user, message);
            break;

          case `history`:
          case `all-time`:
          case `alltime`:
          case `hist`:
            view_inventory_history(user, message);
            break;

          case `help`:
          case `halp`:
          case `info`:
          case `imstuck`:
            fishing_help(user, message);
            break;
        }
      }


    });
  });
};

exports.conf = {
  aliases: [],
  permLevel: 4
};

exports.help = {
  name: "fish",
  description: "Starts fishing",
  usage: "fish"
}
