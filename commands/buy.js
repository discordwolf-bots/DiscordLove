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

const achievement_expensive_taste = (message, value, client) => {
  let sql = `SELECT * FROM users WHERE id = ${message.author.id}`;
  db.get(sql, (err, row) => {
    if(err) return console.error(err.message);
    let expensive_taste_progress = row.achieve_owned_value;
    let achieved = 0;

    for(let i=0; i<config.thresh_expensive_taste.length; i++){
      if(value >= parseInt(config.thresh_expensive_taste.split(',')[i]))
        if(expensive_taste_progress < i+1)
          achieved = i+1;
    }

    if(achieved > 0){
      let rewards = 0;
      for(let i=expensive_taste_progress;i<=achieved;i++){
        for(let j=1; j<=config.thresh_expensive_taste.length; j++){
          if(i == j) rewards += parseInt(config.reward_expensive_taste.split(',')[j-1]);
        }
      }
      let embed = new Discord.RichEmbed()
        .setColor('#4DBF42')
        .setAuthor(`Achievement Gained! - \$${rewards} added!`, message.author.avatarURL)
        .setFooter(`Gained ${achieved-expensive_taste_progress} Levels on the Expensive Taste achievement`);
      message.channel.send(embed);
      let newBalance = row.money + rewards;
      client.channels.get(config.logging).send(`ACHIEVEMENT EXPENSIVE TASTE : ${message.author.username}#${message.author.discriminator} - ${row.money} -> ${newBalance}`);
      let sqlUpdate = `UPDATE users SET money = ${newBalance}, achieve_owned_value = ${achieved} WHERE id = ${message.author.id}`;
      db.run(sqlUpdate, (err) => {
        if(err) return console.error(err.message);
      });
    }
  });
}

const achievement_buy_a_bot = (message, client) => {
  let sql = `SELECT * FROM users WHERE id = ${message.author.id}`;
  db.get(sql, (err, row) => {
    if(err) return console.error(err.message);
    let buy_the_bot_progress = row.achieve_buy_the_bot;
    if(buy_the_bot_progress == 0){
      let sqlUpdate = `UPDATE users SET money = ${row.money+2500}, achieve_buy_the_bot = 1 WHERE id = ${message.author.id}`;
      let embed = new Discord.RichEmbed()
        .setColor('#4DBF42')
        .setAuthor(`Achievement Gained! - \$2,500 added!`, message.author.avatarURL)
        .setFooter(`Completed Hidden achievement`);
      message.channel.send(embed);
      client.channels.get(config.logging).send(`ACHIEVEMENT BUY A BOT : ${message.author.username}#${message.author.discriminator} - ${row.money} -> ${row.money+2500}`);
      db.run(sqlUpdate, (err) => {
        if(err) return console.error(err.message);
      });
    } else {
      message.channel.send(`Stop trying to buy bots!`);
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
  if(target.user.bot && target.user.id == '504720625240113162'){
    message.delete();
    return achievement_buy_a_bot(message, client);
  }
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
          return message.reply(`This user has recently been bought! Please wait another **${tFormat}**`);
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

      client.channels.get(config.logging).send(`BUYING SELF PRICE : ${message.author.username}#${message.author.discriminator} - ${balance} -> ${newBalanceSelf}`);
      client.channels.get(config.logging).send(`BUYING TARGET PRICE : ${target.user.username}#${target.user.discriminator} - ${tBalance} -> ${newBalanceTarget}`);
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
              client.channels.get(config.logging).send(`BUYING OLD OWNER : ${ownerUser.user.username}#${ownerUser.user.discriminator} - ${rowO.money} -> ${oBalance}`);
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
                achievement_expensive_taste(message, buyPrice, client);
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
            achievement_expensive_taste(message, buyPrice, client);
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
