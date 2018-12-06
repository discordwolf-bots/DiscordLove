const config = require(`./config.json`);
const prefix = config.prefix;

const chalk = require('chalk');
const Discord = require('discord.js');
const client = new Discord.Client();
const ddiff = require('return-deep-diff');
const fs = require('fs');
const moment = require('moment');

// Connect to Database before anything else
const sqlite3 = require('sqlite3').verbose();
client.db = new sqlite3.Database('./utils/users.db', sqlite3.OPEN_READWRITE, (err) => {
  if(err){
    console.error(err.message);
  }
  console.log(`Connected to DB`);
});

require('./utils/eventLoader')(client);

const log = (msg) => {
  console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${msg}`);
}

client.getInfoValues = async (client) => {
  let sql_count_users = `SELECT count(*) AS count FROM users`;
  let now = moment().format('x');
  client.db.get(sql_count_users, async (err, row) => {
    if(err) return console.error(`index.js getInfoValues ${err.message}`);
    client.totalUsers = row.count;
    client.timeInitiated = now;
  });
}

client.set_up_server = async (client, guild) => {
  console.log(`Setting up server`);
  let role_name = `DiscordLoved`;
  const role_check = guild.roles.find(role => role.name === 'DiscordLoved');
  if(role_check){
    role = role_check;
    client.create_channels(role, client, guild);
  } else {
    client.create_role(guild).then(role => {
      client.create_channels(role, client, guild);
    });
  }
}
client.check_channels = async (client, guild_object, guild) => {
  let channel_missing = false;
  let setup_channel = guild_object.channels.find(channel => channel.name === `discord-love-setup`)
  let main_channel = guild_object.channels.find(channel => channel.name === `discord-love`)
  let discordlove_category = guild_object.channels.find(channel => channel.name === `DiscordLove` && channel.type == `category`);
  let setup_channel_database = guild_object.channels.find(channel => channel.id === guild.channel_setup)
  let main_channel_database = guild_object.channels.find(channel => channel.id === guild.channel_main)
  if(!setup_channel) channel_missing = true;
  if(!main_channel) channel_missing = true;
  if(!discordlove_category) channel_missing = true;
  if(!setup_channel_database) channel_missing = true;
  if(!main_channel_database) channel_missing = true;
  if(channel_missing) client.set_up_server(client, guild_object);
}
client.remove_old_channels = async (guild) => {
  let setup_channel = guild.channels.find(channel => channel.name === `discord-love-setup`)
  let main_channel = guild.channels.find(channel => channel.name === `discord-love`)
  let discordlove_category = guild.channels.find(channel => channel.name === `DiscordLove` && channel.type == `category`);
  let discordlove_test = guild.channels.find(channel => channel.name === `discord-love-test`);
  if(setup_channel) setup_channel.delete();
  if(main_channel) main_channel.delete();
  if(discordlove_category) discordlove_category.delete()
  if(discordlove_test) discordlove_test.delete();
}
client.create_role = async (guild) => {
  guild.createRole({
    name: `DiscordLoved`
  }).then(role => {
    return role;
  })
}
client.create_channels = async (role, client, guild) => {
  await client.remove_old_channels(guild);
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
            // Check for old rows
            let sql_check = `SELECT * FROM guilds WHERE guild_identifier = ${guild.id}`;
            client.db.get(sql_check, (err, row) => {
              if(err) return console.error(`index.js create_channels ${err.message}`);
              let sql_guild = ``;
              let new_guild = true;
              if(row){
                // Guild is already in the database, lets update the channels
                sql = `UPDATE guilds SET channel_setup = ${channel.id}, channel_main = ${channel_default.id} WHERE guild_identifier = ${guild.id}`;
                new_guild = false;
              } else {
                // New guild is being added
                sql = `INSERT INTO guilds (guild_identifier, guild_owner, channel_setup, channel_main) VALUES(${guild.id},${guild.owner.id},${channel.id},${channel_default.id})`;
              }
              client.db.run(sql, (err) => {
                if(err) return console.error(err.message);
                if(new_guild){
                  embed = new Discord.RichEmbed()
                    .setColor("#00A30D")
                    .setAuthor(`${guild.name} (${guild.memberCount.format(0)} members)`, guild.iconURL)
                    .setFooter(`Owner: ${guild.owner.user.username}#${guild.owner.user.discriminator}`)
                    .setTimestamp();
                  client.channels.get(config.log_guild).send(embed);
                }
                client.user.setActivity(`on ${client.guilds.size.format(0)} servers`);
              });
            })
          })
      })
    })
}

client.guild_info = async (guild, extras, callback) => {
  try {
    let sql = `SELECT * FROM guilds WHERE guild_identifier = ${guild}`;
    if(extras != '') sql = `SELECT * FROM guilds WHERE guild_identifier = ${user} ${extras}`;
    await client.db.get(sql, (err, row) => {
      if(err) return console.error(`index.js - ${err.message}`);
      // console.log(chalk.bold.red(`client.guild_info index.js`));
      // console.log(row);
      return callback(row);
    });
  } catch(e) {
    console.error(e);
  }
}
client.user_info = async (user, extras, callback) => {
  try{
    let sql = `SELECT * FROM users WHERE user_discord = ${user}`;
    if(extras != '') sql = `SELECT * FROM users WHERE user_discord = ${user} ${extras}`;
    await client.db.get(sql, (err, row) => {
      if(err) return console.error(`index.js - ${err.message}`);
      // console.log(chalk.bold.red(`client.user_info index.js`));
      // console.log(row);
      return callback(row);
    });
  } catch(e) {
    console.error(e);
  }
}

client.update_money = async (message, user_id, callback) => {
  try {
    await client.check_premium_status(user_id, async () => {
      await client.check_reputation_status(user_id, async () => {
        let now = moment().format('x');
        await client.user_info(user_id, '', async (user) => {
          let crate_chance = 0;
          if(user){
            let time_difference = now - user.ts_message;
            if(user.premium_status > 0) time_difference *= 2;
            let money_to_add = Math.floor(time_difference/1000) * user.user_cps;
            let sql = ``;

            // Has their history never been logged?
            if(user.user_money_history == 0){
              sql = `UPDATE users SET user_money = ${user.user_money + money_to_add}, user_money_history = ${user.user_money + money_to_add} WHERE user_discord=${user.user_discord}`;
            } else {
              sql = `UPDATE users SET user_money = ${user.user_money + money_to_add}, user_money_history = ${user.user_money_history + money_to_add} WHERE user_discord=${user.user_discord}`;
            }
            await client.db.run(sql, (err) => {
              if(err) return console.error(`index.js update_money ${err.message}`);
              // Update message counter
              if(time_difference > 60 * 1000){
                let sql_update_message;
                let level_up = false;
                let experience_random = (user.premium_status > 0 ? 2 : 1) * (Math.floor(Math.random() * 10)+1);
                let next_level_requirement = Math.floor(Math.pow(user.user_level+1, 1.8)*100);
                if(user.user_experience + experience_random >= next_level_requirement){
                  sql_update_message = `UPDATE users SET user_experience = ${user.user_experience + experience_random}, user_level = ${user.user_level + 1}, counter_messages = ${user.counter_messages+1}, ts_message = ${now} WHERE user_discord = ${user.user_discord}`;
                  level_up = true;
                } else {
                  sql_update_message = `UPDATE users SET user_experience = ${user.user_experience + experience_random}, counter_messages = ${user.counter_messages+1}, ts_message = ${now} WHERE user_discord = ${user.user_discord}`;
                }

                if(level_up){
                  let embed_colour = '#' + user.user_colour;
                  if(user.user_colour == 'RAND') embed_colour = '#' + Math.floor(Math.random()*16777215).toString(16);
                  let embed = new Discord.RichEmbed()
                    .setColor(embed_colour)
                    .setAuthor(`${message.member.displayName} has just reached level ${user.user_level + 1}`, message.author.avatarURL)
                    .setTimestamp();
                  message.channel.send(embed);

                  // Set users nickname on the Official DiscordLove Server
                  // if(message.guild.id == '513786798737195008' && message.author.id != config.botowner)
                  //   message.member.setNickname(`[${user.user_level+1}] ${message.author.username}`);
                }

                client.db.run(sql_update_message, (err) => {
                  if(err) return console.error(`index.js update_counter_messages ${err.message}`);
                });
                // Random rare crate
                let random_crate_number = Math.floor(Math.random() * (user.premium_status > 0 ? 80 : 100));
                if(random_crate_number == 0) crate_chance = 1;
                //if(user.user_id == 1) crate_chance = 1;
              }
              return callback(crate_chance);
            })
          }
        });
      });
    });

  } catch(e) {
    console.log(e.stack);
  }
}
client.check_premium_status = async (user_id, callback) => {
  let discordlove_guild = client.guilds.find(guild => guild.id === '513786798737195008');
  let discordlove_guild_member = discordlove_guild.members.find(member => member.id === user_id);
  let now = moment().format('x');
  await client.user_info(user_id, '', (user) => {
    if(user){
      if(user.premium_status == 1) {
        let time_difference = now - user.premium_time;
        if(time_difference > 0){
          let sql = `UPDATE users SET premium_status = 0 WHERE user_discord = ${user_id}`;
          client.db.run(sql, [], (err) => {
            if(err) return console.error(`index.js check_premium_status ${err.message}`);
            if(discordlove_guild_member){
              discordlove_guild_member.removeRoles([
                discordlove_guild.roles.find(role => role.name === "Lifetime Premium"),
                discordlove_guild.roles.find(role => role.name === "Premium"),
              ])

            }
          });
        }
      }
    }
    return callback();
  });
}
client.check_reputation_status = async (user_id, callback) => {
  let now = moment().format('x');
  await client.user_info(user_id, '', (user) => {
    if(user){
      if(now - (1000 * 60 * 60 * 24) >= user.ts_reputation){
        let sql = `UPDATE users SET reputation_given_today = 0 WHERE user_discord = ${user.user_discord}`;
        client.db.run(sql, [], (err) => {
          if(err) return console.error(`index.js check_reputation_status ${err.message}`);
        });
      }
    }
    return callback();
  })
}

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();

fs.readdir(`./commands/`, (err, files) => {
  if (err) console.error(err);
  log(chalk.bold.cyan(`Loading ${files.length} Commands`));
  client.totalCommands = files.length;
  files.forEach(f => {
    let props = require(`./commands/${f}`);
    log(chalk.bold.cyan(`- ${props.help.name}`));
    client.commands.set(props.help.name, props);
    props.conf.aliases.forEach(alias => {
      client.aliases.set(alias, props.help.name);
    });
  });
});

client.reload = function(command){
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./commands/${command}`)];
      let cmd = require(`./commands/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if(cmd === command) client.aliases.delete(alias);
      });
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch(e){
      reject(e);
    }
  });
};

client.elevation = function(msg){
  let perms = 0;
  if(msg.author.id == config.botowner) perms = 4;
  return perms;
}

client.login(config.token);
