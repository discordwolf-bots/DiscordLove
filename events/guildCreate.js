const Discord = require('discord.js');
const config = require(`../config.json`);
const chalk = require('chalk');
const moment = require('moment');

const log = (msg) => {
  console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${msg}`);
}

const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./utils/users.db', sqlite3.OPEN_READWRITE, (err) => {
  if(err){
    console.error(err.message);
  }
  console.log(`Connected to DB - Message`);
});

module.exports = guild => {
  let client = guild.client;
  const everyone = message.guild.roles.find('name', '@everyone');

  let role_name = `DiscordLoved`;
  // Create DiscordLoved Role
  guild.createRole({
    name: role_name,
  })
    .then(role => {
      console.log(`Stage 1`);
      // Create DiscordLove Category
      log(`Joined guild ${guild.name}`)
      guild.createChannel(`DiscordLove`, `category`, [{
        id: guild.id,
      }])
    })
    .then(category => {
      console.log(`Stage 2`);
      // Create Setup channel
      guild.createChannel(`discord-love-setup`, `text`)
        .then(channel => {
          channel.setParent(category.id);
          channel.overwritePermissions(role, {
            "VIEW_CHANNEL": false
          })

          // Create default channel
          guild.createChannel(`discord-love`, `text`)
            .then(channel_default => {
              console.log(`Stage 3`);
              channel_default.setParent(category.id);
              channel_default.overwritePermissions(role, {
                "VIEW_CHANNEL": true
              });
              channel_default.overwritePermissions(everyone, {
                "VIEW_CHANNEL": false
              })

              // Add to database
              let sql = `INSERT INTO guilds (guild_identifier, guild_owner, channel_setup, channel_main) VALUES(?,?,?,?)`;
              let data = [guild.id, guild.owner.id, channel.id, channel_default.id];
              db.run(sql, data, (err) => {
                if(err) return console.error(err.message);
                console.log(`Stage 4`);
                embed = new Discord.RichEmbed()
                  .setColor("#00A30D")
                  .setAuthor(`${guild.name}`, guild.iconURL)
                  .setFooter(`New Guild`)
                  .setTimestamp();
                client.channels.get(config.log_guild).send(embed);
              })
            })
        })
    })
    .then(category => {

    })
    .then(default_channel => {

    })

}
