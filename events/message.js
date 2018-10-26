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
    if(message.author.bot) return;
    if(message.channel.type !== "text") return;
    const client = message.client;
    const params = message.content.split(' ').slice(1);

    var command = "";
    var bool = false;
    var giveExp = true;

    if(message.content.startsWith(config.prefix)){
      command = message.content.split(' ')[0].slice(config.prefix.length);
      bool = true;
      giveExp = false;
    } else if(message.content.startsWith(config.prefixtext)){
      command = message.content.split(' ')[0].slice(config.prefixtext.length);
      bool = true;
      giveExp = false;
    } else if(message.content.startsWith(config.prefixemoji)){
      command = message.content.split(' ')[0].slice(config.prefixemoji.length);
      bool = true;
      giveExp = false;
    }

    if(message.channel.id == '481585772718194708') giveExp = false;
    if(message.channel.id == '481585743534227461') giveExp = false;
    if(message.channel.id == '481588503612751882') giveExp = false;
    if(message.channel.id == '487990607088844817') giveExp = false;
    if(message.channel.id == '501886295136796672') giveExp = false;
    if(message.channel.id == '481587436657442822') giveExp = false;
    if(message.channel.id == '481587506664570890') giveExp = false;

    if(bool){
      let perms = client.elevation(message);
      let cmd;
      if(client.commands.has(command)){
        cmd = client.commands.get(command);
      } else if(client.aliases.has(command)){
        cmd = client.commands.get(client.aliases.get(command));
      }
      if(cmd){
        if(perms < cmd.conf.permLevel){
          let embed = new Discord.RichEmbed()
            .setColor(`#ff0000`)
            .addField(`Error!`, `You do not have the permissions to use ${command}`)
            .setTimestamp();
          return message.channel.send({embed : embed});
        }
        cmd.run(client, message, params, perms);
      }
    }

    if(giveExp){
      let sqlCheck = `SELECT * FROM users WHERE id = ${message.author.id}`;
      db.get(sqlCheck, [], (err, row) => {
        if(err) return console.error(err.message);
        if(!row) return;
        let min = 5;
        let max = 10;
        let random = Math.floor(Math.random() * (max-min)) + min;

        let sqlAdd = `UPDATE users SET money = ? WHERE id = ?`;
        let dataAdd = [row.money + random, message.author.id];
        db.run(sqlAdd, dataAdd, (err) => {
          if(err) return console.error(err.message);
          if(row.owner != 0){
            let sqlCheckOwner = `SELECT * FROM users WHERE id = ${row.owner}`;
            db.get(sqlCheckOwner, [], (err, rowO) => {
              if(err) return console.error(err.message);
              if(!rowO) return;
              let sqlAddOwner = `UPDATE users SET money = ? WHERE id = ?`;
              let dataAddOwner = [rowO.money + Math.floor(random / 4), rowO.id];
              db.run(sqlAddOwner, dataAddOwner, (err) => {
                if(err) return console.error(err.message);
                console.log(`(User) ${message.guild.members.get(row.id).user.username}: ${row.money} -> ${row.money+random}`);
                console.log(`(Owner) ${message.guild.members.get(rowO.id).user.username}: ${rowO.money} -> ${rowO.money + Math.floor(random/4)}`);
                console.log(` `);
              });
            });
          }
        });

      });
    }

  } catch(e) {
    console.log(e.stack);
  }
}
