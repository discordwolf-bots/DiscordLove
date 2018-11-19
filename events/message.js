const config = require(`../config.json`);

const Discord = require(`discord.js`);
const fs = require('fs');
const chalk = require('chalk');
const ms = require('ms');
const moment = require('moment');

const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./utils/users.db', sqlite3.OPEN_READWRITE, (err) => {
  if(err){
    console.error(err.message);
  }
  console.log(`Connected to DB - Message`);
});

module.exports = message => {
  try {
    if(message.author.bot) return; // Is it a bot talking?
    if(message.channel.type !== "text") return; // Is it actually a text channel?

    const client = message.client; // Give us a `client` variable
    const params = message.content.replace(/ +(?= )/g,'').split(' ').slice(1); // Remove all double spaces
    let now = moment().format('x'); // Current UNIX Timestamp

    client.guild_info(message.guild.id, '', (guild) => {
      client.user_info(message.author.id, '', (user) => {
        console.log(`Stage 1`);
        // Check if the message is a command
        let command = "";
        let foundCommand = false;
        if(message.content.startsWith(config.prefix)){
          console.log(`Stage 2`);
          command = message.content.split(' ')[0].slice(config.prefix.length).toLowerCase();
        }

        // If it started with the prefix, lets see if it was actually a valid command
        if(foundCommand){
          console.log(`Stage 3`);
          let perms = client.elevation(message); // Gets the users permission level
          let cmd;
          if(client.commands.has(command)){ // Did they type the full command?
            cmd = client.commands.get(command);
          } else if(client.aliases.has(command)){ // Did they type an alias of a command?
            cmd = client.commands.get(client.aliases.get(command));
          }

          // We have found a command
          if(cmd){
            console.log(`Stage 4`);
            // Do they have permissions to run this command?
            if(perms < cmd.conf.permLevel){
              let embed = new Discord.RichEmbed()
                .setColor(`#ff0000`)
                .setTitle(`Error! You do not have the permissions to use ${command}`)
                .setTimestamp();
              return message.channel.send({embed : embed});
            }
            // Okay, they can use this command, lets run it
            console.log(`Stage 5`);
            cmd.run(client, message, params, perms);
          }
        } else {
          // It wasnt a command, lets add some experience!
          //client.update_money(user);
        }

      });
    });

  } catch(e) {
    console.log(e.stack);
  }
}
