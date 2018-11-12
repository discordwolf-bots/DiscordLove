const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const config = require(`../config.json`);

const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./utils/users.db', sqlite3.OPEN_READWRITE, (err) => {
  if(err){
    console.error(err.message);
  }
  console.log(`Connected to DB - Increase`);
});

Number.prototype.format = function(n, x) {
  var re = '(\\d)(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
  return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$1,');
};

exports.run = async function(client, message, args){
  let now = moment().format('x');
  let targetUser = message.mentions.members.first();
  let target = targetUser.user.id;
  if(!target) return message.channel.send("Please mention the user you want to increase the price of!");

  let sql1 = `SELECT * FROM uses WHERE id = ${message.author.id}`;
  db.get(sql1, (err, rowOwner)=> {
    if(err) return console.error(err.message);
    let sql2 = `SELECT * FROM users WHERE id = ${target}`;
    db.get(sql2, (err, rowTarget)=> {
      if(err) return console.error(err.message);

      let currentCost = rowTarget.cost - 100;
      let ownerMoney = rowOwner.money;
      let targetMoney = rowTarget.money;

      let increase = 100;
      if(args[1]){
        increase = parseInt(args[1]);
        if(args[1].length < 1) increase = 100;
        if(parseInt(args[1]) != args[1]) buyPrice = 100;
      }

      if(increase >= ownerMoney) {
        // Get the nearest 100
        let nearest100 = Math.floor(ownerMoney/100);
        nearest100 *= 100;
        increase = nearest100;
      }

      if(increase < 100) increase = 100;

      let newCost = currentCost + increase;
      let newMoney = ownerMoney - increase;
      let targetIncrease = increase * 0.4;

      let sql3 = `UPDATE users SET money = ${newMoney} WHERE id = ${message.author.id}`;
      let sql4 = `UPDATE users SET money = ${targetMoney+targetIncrease}, cost = ${newCost+100}, lastpurchase = ${now} WHERE id = ${target}`;

      db.run(sql3, (err) => {
        if(err) return console.error(err.message);
        db.run(sql4, (err) => {
          if(err) return console.error(err.message);

          message.reply(`You have successfully increased the price of <@${target}> to ${newCost.format(0)}`);
          client.channels.get(config.logging).send(`:dollar: INCREASE PRICE OWNER : ${message.author.username}#${message.author.discriminator} - ${ownerMoney} -> ${newMoney}`);
          client.channels.get(config.logging).send(`:heavy_dollar_sign: INCREASE PRICE TARGET : ${targetUser.user.username}#${targetUser.user.discriminator} - ${targetMoney} -> ${targetMoney+targetIncrease}`);

        });
      });


    });
  });
};

exports.conf = {
  aliases: [],
  permLevel: 4
};

exports.help = {
  name: "increase",
  description: "Increases a users value",
  usage: "increase <@user>"
}
