const config = require(`../config.json`);

const Discord = require(`discord.js`);
const fs = require('fs');
const chalk = require('chalk');
const ms = require('ms');
const moment = require('moment');

const run_command = (client, message, params) => {
  // Check if the message is a command
  let command = "";
  let foundCommand = false;
  if(message.content.startsWith(config.prefix)){
    command = message.content.split(' ')[0].slice(config.prefix.length).toLowerCase();
    foundCommand = true;
  }

  // If it started with the prefix, lets see if it was actually a valid command
  if(foundCommand){
    let perms = client.elevation(message); // Gets the users permission level
    let cmd;
    if(client.commands.has(command)){ // Did they type the full command?
      cmd = client.commands.get(command);
    } else if(client.aliases.has(command)){ // Did they type an alias of a command?
      cmd = client.commands.get(client.aliases.get(command));
    }

    // We have found a command
    if(cmd){
      // Do they have permissions to run this command?
      if(perms < cmd.conf.permLevel){
        let embed = new Discord.RichEmbed()
          .setColor(`#ff0000`)
          .setTitle(`Error! You do not have the permissions to use ${command}`)
          .setTimestamp();
        return message.channel.send({embed : embed});
      }
      // Okay, they can use this command, lets run it
      cmd.run(client, message, params, perms);
    }
  } else {
    // Not a valid command (wrong spelling or just regular chat, do something else)
  }
}

module.exports = async message => {
  try {
    if(message.author.bot) return; // Is it a bot talking?
    if(message.channel.type !== "text") return; // Is it actually a text channel?

    const client = message.client; // Give us a `client` variable
    const params = message.content.replace(/ +(?= )/g,'').split(' ').slice(1); // Remove all double spaces
    let now = moment().format('x'); // Current UNIX Timestamp

    // Update users money
    await client.user_info(message.author.id, '', async (user) => {
      if(user){
        await client.update_money(message.author.id, async () => {
          await run_command(client, message, params);
        });
      } else {
        run_command(client, message, params);
      }
    });

  } catch(e) {
    console.log(e.stack);
  }
}
