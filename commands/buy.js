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

const achievement_expensive_taste = (message, value) => {
  let sql = `SELECT * FROM users WHERE id = ${message.author.id}`;
  db.get(sql, (err, row) => {
    if(err) return console.error(err.message);
    let expensive_taste_progress = row.achieve_owned_value;
    let achieved = 0;
    if(value >= 1000)
      if(expensive_taste_progress < 1)
        achieved = 1;
    if(value >= 2500)
      if(expensive_taste_progress < 2)
        achieved = 2;
    if(value >= 5000)
      if(expensive_taste_progress < 3)
        achieved = 3;
    if(value >= 10000)
      if(expensive_taste_progress < 4)
        achieved = 4;
    if(value >= 20000)
      if(expensive_taste_progress < 5)
        achieved = 5;
    if(value >= 50000)
      if(expensive_taste_progress < 6)
        achieved = 6;
    if(value >= 100000)
      if(expensive_taste_progress < 7)
        achieved = 7;
    if(value >= 250000)
      if(expensive_taste_progress < 8)
        achieved = 8;
    if(value >= 500000)
      if(expensive_taste_progress < 9)
        achieved = 9;
    if(value >= 1000000)
      if(expensive_taste_progress < 10)
        achieved = 10;
    if(achieved > 0){
      let rewards = 0;
      for(let i=expensive_taste_progress;i<=achieved;i++){
        if(i == 1) rewards += 500;
        if(i == 2) rewards += 1000;
        if(i == 3) rewards += 1500;
        if(i == 4) rewards += 2000;
        if(i == 5) rewards += 2500;
        if(i == 6) rewards += 5000;
        if(i == 7) rewards += 7500;
        if(i == 8) rewards += 10000;
        if(i == 9) rewards += 15000;
        if(i == 10) rewards += 25000;
      }
      let embed = new Discord.RichEmbed()
        .setColor('#4DBF42')
        .setAuthor(`Achievement Gained! - \$${rewards} added!`, message.author.avatarURL)
        .setFooter(`Gained ${achieved-expensive_taste_progress} Levels on the Expensive Taste achievement`);
      message.channel.send(embed);
      let newBalance = row.money + rewards;
      let sqlUpdate = `UPDATE users SET money = ${newBalance}, achieve_owned_value = ${achieved} WHERE id = ${message.author.id}`;
      db.run(sqlUpdate, (err) => {
        if(err) return console.error(err.message);
      });
    }
  });
}

Number.prototype.format = function(n, x) {
  var re = '(\\d)(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
  return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$1,');
};

exports.run = async function(client, message, args){
  let now = moment().format('DDMMYYhhmmss');
  let target = message.mentions.members.first();
  if(!target) return message.channel.send("Please mention the user you want to buy!");
  if(target.user.id == message.author.id) return message.channel.send(`You cannot purchase yourself`);
  if(target.user.bot) return message.channel.send(`Stop trying to buy bots!`);

  if(args[1]){
    buyPrice = parseInt(args[1]);
    if(args[1].length < 1) buyPrice = 0;
    if(parseInt(args[1]) != args[1]) buyPrice = 0;
  }
  if(!args[1]) buyPrice = 0;

  let sqlCheckSelf = `SELECT * FROM users WHERE id = ${message.author.id}`;
  let sqlCheckTarget = `SELECT * FROM users WHERE id = ${target.user.id}`;

  await db.get(sqlCheckSelf, [], (err, row) => {
    if(err) return console.error(err.message);
    if(!row){
      return message.channel.send(`Please do the command **${config.prefix}start** in ${message.guild.channels.get('505128715202723850').toString()} first!`);
    }
  });

  await db.get(sqlCheckTarget, [], (err, row) => {
    if(err) return console.error(err.message);
    if(!row){
      return message.channel.send(`This user needs to setup their own profile.`);
    }
  });

  await db.get(sqlCheckSelf, [], (err, rowS) => {
    if(!rowS) {
      return message.channel.send(`Please do the command **${config.prefix}start** in ${message.guild.channels.get('505128715202723850').toString()} first!`);
    }
    let balance = rowS.money;
    db.get(sqlCheckTarget, [], (err, rowT) => {
      if(!rowT) {
        return message.channel.send(`This user needs to setup their own profile.`);
      }
      let cost = rowT.cost;
      let owner = rowT.owner;
      let tBalance = rowT.money;

      if(now - parseInt(rowT.lastpurchase) < 300){
        message.delete();
        let tFormat = "";
        let tDiff = 300 - (now - parseInt(rowT.lastpurchase)); // 295
        let tDiffMins = Math.floor(tDiff / 60);
        if(tDiffMins >= 2) {
          tFormat = tDiffMins + " minutes";
        } else if(tDiffMins == 1) {
          tFormat = tDiffMins + " minute";
        }
        let tDiffSecs = tDiff - (tDiffMins * 60);
        if(tDiffSecs >= 2) {
          tFormat += " " + tDiffSecs + " seconds";
        } else if(tDiffSecs == 1){
          tFormat += " " + tDiffSecs + " second";
        }
          //return message.reply(`This user has recently been bought! Please wait another **${tFormat}**`);
      }

      if(owner == message.author.id) return message.channel.send(`You already own this member`);
      if(buyPrice == 0) buyPrice = parseInt(cost);
      if(balance < buyPrice) buyPrice = balance;
      if(buyPrice < cost) return message.channel.send(`The minimum bid on this user is **${cost.format(0)}**`);
      if(balance < cost) return message.channel.send(`You do not have enough money to buy this user (require ${cost.format(0)}, have ${balance.format(0)})`);
      let newBalanceSelf = balance - buyPrice;
      let newBalanceTarget = tBalance;
      let difference = parseInt(buyPrice) - parseInt(cost);
      difference += 100;
      difference *= 0.1;
      newBalanceTarget += difference;

      let sqlUpdateSelf = `UPDATE users SET money = ? WHERE id = ?`;
      let dataUpdateSelf = [newBalanceSelf, message.author.id];
      db.run(sqlUpdateSelf, dataUpdateSelf, (err) => {
        if(err) return console.error(err.message);

        let sqlUpdateTarget = `UPDATE users SET money = ?, owner = ?, cost = ?, lastpurchase = ? WHERE id = ?`;
        let dataUpdateTarget = [newBalanceTarget, message.author.id.toString(), buyPrice+100, now, target.user.id];
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
                expensive_taste_progress(message, buyPrice);
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
            expensive_taste_progress(message, buyPrice);
          }
        });

      });

    });
  });

  let sql = `SELECT * FROM users`;
  db.all(sql, [], (err, rows) => {
    if(err) return console.error(err.message);
    let value = 0;
    let counter = 0;
    rows.forEach((row) => {
      counter++;
      value += row.cost - 100;
    });
    client.user.setActivity(`${counter} users worth \$${value.format(0)}`);
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
