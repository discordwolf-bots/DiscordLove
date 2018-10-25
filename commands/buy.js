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
  //if(target.user.id == message.author.id) return message.channel.send(`You cannot purchase yourself`);

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
    let balance = rowS.money;
    db.get(sqlCheckTarget, [], (err, rowT) => {
      let cost = rowT.cost;
      let owner = rowT.owner;
      let tBalance = rowT.money;

      //if(owner == message.author.id) return message.channel.send(`You already own this member`);
      // let sqlCheckOwner = `SELECT * FROM users WHERE id = owner`;
      // db.get(sqlCheckOwner, [], (err, rowO) => {
      //   if(err) return console.error(err.message);
      //   if(rowO) return message.channel.send(`Row found`);
      //   message.channel.send(`No row found`);
        // let oBalance = rowO.money;
        // let newBalanceOwner = oBalance + (cost * 0.8);
        // message.channel.send(oBalance);
      //});

      if(balance < cost) return message.channel.send(`You do not have enough money to buy this user (require ${cost.format(0)}, have ${balance.format(0)})`);
      let newBalanceSelf = balance - cost;
      let newBalanceTarget = tBalance + (cost *0.1);

      let sqlUpdateSelf = `UPDATE users SET money = ? WHERE id = ?`;
      let dataUpdateSelf = [newBalanceSelf, message.author.id];
      db.run(sqlUpdateSelf, dataUpdateSelf, (err) => {
        if(err) return console.error(err.message);

        let sqlUpdateTarget = `UPDATE users SET money = ?, owner = ?, cost = ? WHERE id = ?`;
        let dataUpdateTarget = [newBalanceTarget, message.author.id, cost+100, target.user.id];
        db.run(sqlUpdateTarget, dataUpdateTarget, (err) => {
          if(err) return console.error(err.message);

          if(owner != 0){
            let sqlCheckOwner = `SELECT * FROM users WHERE id = ${owner}`;
            db.get(sqlCheckOwner, [], (err, rowO) => {
              if(err) return console.error(err.message);
              let oBalance = rowO.money;
              let newBalanceOwner = oBalance + (cost * 0.8);

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
                  .addField(`New Value`, `**\$** ${(cost+100).format(0)}`, true)
                  .addField(`New Owner`, `${message.author.username}`);
                message.channel.send(embed);
              });
            });
          } else {
            let embed = new Discord.RichEmbed()
              .setColor(`#F7AA8D`)
              .setColor(`#DA5020`)
              .setTitle(`Purchase Receipt of ${target.user.username}`)
              .setThumbnail(`${target.user.avatarURL}`)
              .addField(`Old Value`, `**\$** ${cost.format(0)}`, true)
              .addField(`New Value`, `**\$** ${(cost+100).format(0)}`, true)
              .addField(`New Owner`, `${message.author.username}`);
            message.channel.send(embed);
          }
        });

      });

    });
  });

  // let sqlCheck = `SELECT * FROM users WHERE id = ${message.author.id}`;
  // db.get(sqlCheck, [], (err,row) => {
  //   if(err) return console.error(err.message);
  //   if(!row){
  //     let sqlInsert = `INSERT INTO users (id) VALUES (${message.author.id})`;
  //     db.run(sqlInsert, [], (err) => {
  //       if(err) return console.error(err.message);
  //       message.channel.send("Your profile has been created!");
  //     });
  //   }
  // });
  //
  // let sqlFetch = `SELECT * FROM users WHERE id = ${message.author.id}`;
  // db.get(sqlFetch, [], (err, row) => {
  //   if(row){
  //     let owner = row.owner;
  //     let ownerName = "None";
  //     if(owner != 0) ownerName = "<@" + owner + ">";
  //     let profile = new Discord.RichEmbed()
  //       .setColor(`#DA5020`)
  //       .setTitle(`Profile of ${message.author.username}`)
  //       .setThumbnail(`${message.author.avatarURL}`)
  //       .addField(`Current Bank`, `**\$** ${row.money.format(0)}`, true)
  //       .addField(`Current Value`, `**\$** ${row.value.format(0)}`, true)
  //       .addField(`Current Owner`, `${ownerName}`);
  //     message.channel.send({embed:profile});
  //   }
  // });

  let embed = new Discord.RichEmbed()
    .setColor(`#6D0A0A`)
    .setAuthor(`${message.author.username} used command 'profile'`, message.author.avatarURL)
    .setFooter(`Command Used`)
    .setTimestamp();
  //client.channels.get(config.commands).send({embed});
};

exports.conf = {
  aliases: [],
  permLevel: 4
};

exports.help = {
  name: "buy",
  description: "Buys a user",
  usage: "buy"
}
