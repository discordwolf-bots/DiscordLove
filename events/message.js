const config = require(`../config.json`);

const Discord = require(`discord.js`);
const fs = require('fs');
const chalk = require('chalk');
const ms = require('ms');
const moment = require('moment');

const run_command = (client, message, params) => {
  // Check if the message is a command
  let command = "";
  let prefixUsed = false;
  if(message.content.startsWith(config.prefix)){
    command = message.content.split(' ')[0].slice(config.prefix.length).toLowerCase();
    prefixUsed = true;
  }

  // If it started with the prefix, lets see if it was actually a valid command
  if(prefixUsed){
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
      await client.guild_info(message.guild.id, '', async (guild) => {
        client.check_channels(client, message.guild, guild);
        if(user){
          await client.update_money(message, message.author.id, async (crate_chance) => {
            let embed_colour = '#' + user.user_colour;
            if(user.user_colour == 'RAND') embed_colour = '#' + Math.floor(Math.random()*16777215).toString(16);
            switch(crate_chance){
              case 0:
              default:
                break;
              case 1:
                let embed = new Discord.RichEmbed()
                  .setColor(embed_colour)
                  .setAuthor(`${message.member.displayName} just found a Rare Crate!`, message.author.avatarURL)
                  .setTimestamp();
                message.channel.send(embed);
                let sql_add_rare_crate = `UPDATE users SET crate_rare = ${user.crate_rare + 1} WHERE user_discord = ${user.user_discord}`;
                client.db.run(sql_add_rare_crate, (err) => {
                  if(err) return console.error(`message.js Adding rare crate ${err.message}`);
                });
                break;
            }
            return run_command(client, message, params);
          });
        } else {
          return run_command(client, message, params);
        }
      });
    });

  } catch(e) {
    console.log(e.stack);
  }
}
