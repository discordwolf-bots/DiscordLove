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

const set_up_server = (client, guild) => {
  let role_name = `DiscordLoved`;
  const everyone = guild.roles.find(role => role.name === '@everyone');
  // Create DiscordLoved Role
  guild.createRole({
    name: role_name,
  })
    .then(role => {
      // Create DiscordLove Category
      guild.createChannel(`DiscordLove`, `category`, [{
        id: guild.id,
      }])
      .then(category => {
        // Create Setup channel
        guild.createChannel(`discord-love-setup`, `text`)
          .then(channel => {
            channel.setParent(category.id);
            channel.overwritePermissions(role, {
              VIEW_CHANNEL: false
            });
            channel.overwritePermissions(guild.id, {
              VIEW_CHANNEL: true
            });

            // Create default channel
            guild.createChannel(`discord-love`, `text`)
              .then(channel_default => {
                channel_default.setParent(category.id);
                channel_default.overwritePermissions(role, {
                  VIEW_CHANNEL: true
                });
                channel_default.overwritePermissions(guild.id, {
                  VIEW_CHANNEL: false
                });

                // Add to database
                let sql = `INSERT INTO guilds (guild_identifier, guild_owner, channel_setup, channel_main) VALUES(?,?,?,?)`;
                let data = [guild.id, guild.owner.id, channel.id, channel_default.id];
                db.run(sql, data, (err) => {
                  if(err) return console.error(err.message);
                  embed = new Discord.RichEmbed()
                    .setColor("#00A30D")
                    .setAuthor(`${guild.name} (${guild.memberCount.format(0)} members)`, guild.iconURL)
                    .setFooter(`Owner: ${guild.owner.user.username}#${guild.owner.user.discriminator}`)
                    .setTimestamp();
                  client.channels.get(config.log_guild).send(embed);
                })
              })
          })
        })
    })
}

module.exports = guild => {
  let client = guild.client;

  let sql = `SELECT * FROM guilds WHERE guild_identifier = ${guild.id}`;
  db.get(sql, [], (err, row) => {
    if(err) return console.error(err.message);
    if(row){
      let sql2 = `DELETE FROM guilds WHERE guild_identifier = ${guild.id}`;
      db.run(sql2, (err) => {
        if(err) return console.error(err.message);
        set_up_server(client, guild);
      });
    } else {
      set_up_server(client, guild);
    }
  })
}
