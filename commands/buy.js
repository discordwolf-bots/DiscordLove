const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);

const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./utils/users.db', sqlite3.OPEN_READWRITE, (err) => {
  if(err){
    console.error(err.message);
  }
  console.log(`Connected to DB - Buy`);
});


Number.prototype.format = function(n, x) {
  var re = '(\\d)(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
  return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$1,');
};

const addNewUser = (id) => {
  let sql = `INSERT INTO users (id) VALUES (${id})`;
  db.run(sql, [], (err) => {
    if(err) return console.error(err.message);
  });
}

exports.run = async function(client, message, args){
  let target = message.mentions.members.first();
  if(!target) return message.channel.send("Please mention the user you want to buy!");
  if(target.user.id == message.author.id) return message.channel.send(`You cannot purchase yourself`);
  if(target.user.bot) return message.channel.send(`Stop trying to buy bots!`);

  if(args[1]) buyPrice = parseInt(args[1]);
  if(!args[1]) buyPrice = 0;

  let sqlCheckSelf = `SELECT * FROM users WHERE id = ${message.author.id}`;
  let sqlCheckTarget = `SELECT * FROM users WHERE id = ${target.user.id}`;

  await db.get(sqlCheckSelf, [], (err, row) => {
    if(err) return console.error(err.message);
    if(!row){
      addNewUser(message.author.id);
    }
  });

  await db.get(sqlCheckTarget, [], (err, row) => {
    if(err) return console.error(err.message);
    if(!row){
      addNewUser(target.user.id);
    }
  });

  await db.get(sqlCheckSelf, [], (err, rowS) => {
    if(!rowS) {
      addNewUser(message.author.id);
      return message.channel.send("Your profile has just been created! Please try and purchase again.");
    }
    let balance = rowS.money;
    db.get(sqlCheckTarget, [], (err, rowT) => {
      if(!rowT) {
        addNewUser(target.user.id);
        return message.channel.send("Targets profile has just been created! Please try and purchase again.");
      }
      let cost = rowT.cost;
      let owner = rowT.owner;
      let tBalance = rowT.money;

      if(owner == message.author.id) return message.channel.send(`You already own this member`);
      if(buyPrice == 0) buyPrice = parseInt(cost);
      console.log(typeof buyPrice);
      if(balance < buyPrice) buyPrice = balance;
      if(buyPrice < cost) return message.channel.send(`The minimum bid on this user is **${cost.format(0)}**`);
      if(balance < cost) return message.channel.send(`You do not have enough money to buy this user (require ${cost.format(0)}, have ${balance.format(0)})`);
      let newBalanceSelf = balance - buyPrice;
      let newBalanceTarget = tBalance;
      console.log(newBalanceTarget); // 1012
      let difference = parseInt(buyPrice) - parseInt(cost);
      console.log(buyPrice); // 2200
      console.log(cost); // 2200
      console.log(difference); // 0
      console.log(typeof difference);
      difference *= 0.1;
      console.log(difference); // 0
      newBalanceTarget += difference;
      console.log(newBalanceTarget); // 1012
      console.log(`Self - Balance: ${balance}, New Balance: ${newBalanceSelf}`);
      console.log(`Target - Balance: ${tBalance}, New Balance: ${newBalanceTarget}`);

      let sqlUpdateSelf = `UPDATE users SET money = ? WHERE id = ?`;
      let dataUpdateSelf = [newBalanceSelf, message.author.id];
      db.run(sqlUpdateSelf, dataUpdateSelf, (err) => {
        if(err) return console.error(err.message);

        let sqlUpdateTarget = `UPDATE users SET money = ?, owner = ?, cost = ? WHERE id = ?`;
        let dataUpdateTarget = [newBalanceTarget, message.author.id.toString(), buyPrice+100, target.user.id];
        db.run(sqlUpdateTarget, dataUpdateTarget, (err) => {
          if(err) return console.error(err.message);

          if(owner != 0){
            let ownerUser = message.guild.members.get(message.author.id);
            let ownerName = "None";
            if(ownerUser){
              if(ownerUser.nickname != null){
                ownerName = `** ${ownerUser.nickname}** (${ownerUser.user.username}#${ownerUser.user.discriminator})`;
              } else {
                ownerName = `** ${ownerUser.user.username}** (${ownerUser.user.username}#${ownerUser.user.discriminator})`;
              }
            }
            if(!ownerUser) ownerName = "<" + owner + ">";

            let sqlCheckOwner = `SELECT * FROM users WHERE id = ${owner}`;
            db.get(sqlCheckOwner, [], (err, rowO) => {
              if(err) return console.error(err.message);
              let oBalance = rowO.money;
              let newBalanceOwner = oBalance + cost + ((buyPrice - cost) * 0.8);

              let sqlUpdateOwner = `UPDATE users SET money = ? WHERE id = ?`;
              let dataUpdateOwner = [newBalanceOwner, owner];
              db.run(sqlUpdateOwner, dataUpdateOwner, (err) => {
                if(err) return console.error(err.message);
                let embed = new Discord.RichEmbed()
                  .setColor(`#F7AA8D`)
                  .setColor(`#DA5020`)
                  .setTitle(`Purchase Receipt of ${target.user.username}`)
                  .setThumbnail(`${target.user.avatarURL}`)
                  .addField(`Old Value`, `**\$** ${cost.format(0)}`, true)
                  .addField(`New Value`, `**\$** ${(buyPrice+100).format(0)}`, true)
                  .addField(`New Owner`, `${ownerName}`);
                message.channel.send(embed);
              });
            });
          } else {
            let ownerUser = message.guild.members.get(message.author.id);
            if(ownerUser){
              if(ownerUser.nickname != null){
                ownerName = `** ${ownerUser.nickname}** (${ownerUser.user.username}#${ownerUser.user.discriminator})`;
              } else {
                ownerName = `** ${ownerUser.user.username}** (${ownerUser.user.username}#${ownerUser.user.discriminator})`;
              }
            }
            let embed = new Discord.RichEmbed()
              .setColor(`#F7AA8D`)
              .setColor(`#DA5020`)
              .setTitle(`Purchase Receipt of ${target.user.username}`)
              .setThumbnail(`${target.user.avatarURL}`)
              .addField(`Old Value`, `**\$** ${cost.format(0)}`, true)
              .addField(`New Value`, `**\$** ${(buyPrice+100).format(0)}`, true)
              .addField(`New Owner`, `${ownerName}`);
            message.channel.send(embed);
          }
        });

      });

    });
  });

  let embed = new Discord.RichEmbed()
    .setColor(`#6D0A0A`)
    .setAuthor(`${message.author.username} used command 'buy ${args.join(' ')}'`, message.author.avatarURL)
    .setFooter(`Command Used`)
    .setTimestamp();
  client.channels.get(config.commands).send({embed});
};

exports.conf = {
  aliases: [],
  permLevel: 0
};

exports.help = {
  name: "buy",
  description: "Buys a user",
  usage: "buy"
}
