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

const achievement_talks_a_lot = (message, value, client, random) => {
  let sql = `SELECT * FROM users WHERE id = ${message.author.id}`;
  db.get(sql, (err, row) => {
    if(err) return console.error(err.message);
    let talks_a_lot_progress = row.achieve_talks_a_lot;
    let achieved = 0;

    for(let i=0; i<config.thresh_talks_a_lot.length; i++){
      if(value >= parseInt(config.thresh_talks_a_lot.split(',')[i]))
        if(talks_a_lot_progress < i+1)
          achieved = i+1;
    }

    if(achieved > 0){
      let rewards = 0;
      for(let i=talks_a_lot_progress;i<=achieved;i++){
        for(let j=1; j<=config.thresh_talks_a_lot.length; j++){
          if(i == j) rewards += parseInt(config.rewards.split(',')[j-1]);
        }
      }
      let embed = new Discord.RichEmbed()
        .setColor('#4DBF42')
        .setAuthor(`Achievement Gained! - \$${rewards} added!`, message.author.avatarURL)
        .setFooter(`Gained ${achieved-talks_a_lot_progress} Levels on the Talks a Lot achievement`);
      message.channel.send(embed);
      let newBalance = row.money + random + rewards;
      let sqlUpdate = `UPDATE users SET money = ${newBalance}, achieve_talks_a_lot = ${achieved} WHERE id = ${message.author.id}`;
      db.run(sqlUpdate, (err) => {
        if(err) return console.error(err.message);
        client.channels.get(config.logging).send(`:speaking_head: ACHIEVEMENT TALKS A LOT : ${message.author.username}#${message.author.discriminator} - ${row.money} -> ${newBalance}`);
      });
    }
  });
}

module.exports = message => {
  try {

    let now = moment().format('x');
    if(message.author.bot) return;
    if(message.channel.type !== "text") return;
    if(message.guild.id != '480906420133429259') return;
    const client = message.client;
    const params = message.content.replace(/ +(?= )/g,'').split(' ').slice(1);

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
    if(message.channel.id == '510954840139104266') giveExp = false; // #memes

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

        if(now - parseInt(row.lastmessage) < 60 * 1000) return;
        let min = 20;
        let max = 40;
        let random = Math.floor(Math.random() * (max-min)) + min;

        let talks_a_lot_progress = row.messagesSent+1;
        let sqlAdd = `UPDATE users SET money = ?, messagesSent = ? WHERE id = ?`;
        let dataAdd = [row.money + random, row.messagesSent+1, message.author.id];
        db.run(sqlAdd, dataAdd, (err) => {
          if(err) return console.error(err.message);
          client.channels.get(config.logging).send(`:speech_left: TALKING SELF : ${message.author.id} - ${row.money} -> ${row.money + random}`);
          achievement_talks_a_lot(message, talks_a_lot_progress, client, random);
          if(row.owner != 0){
            let sqlCheckOwner = `SELECT * FROM users WHERE id = ${row.owner}`;
            db.get(sqlCheckOwner, [], (err, rowO) => {
              if(err) return console.error(err.message);
              if(!rowO) return;
              let sqlAddOwner = `UPDATE users SET money = ? WHERE id = ?`;
              let dataAddOwner = [rowO.money + Math.floor(random / 4), rowO.id];
              db.run(sqlAddOwner, dataAddOwner, (err) => {
                if(err) return console.error(err.message);
                client.channels.get(config.logging).send(`:speech_balloon: TALKING OWNER : ${row.owner} - ${rowO.money} -> ${rowO.money + Math.floor(random / 4)}`);
                // console.log(`(User) ${message.guild.members.get(row.id).user.username}: ${row.money} -> ${row.money+random}`);
                // console.log(`(Owner) ${message.guild.members.get(rowO.id).user.username}: ${rowO.money} -> ${rowO.money + Math.floor(random/4)}`);
                let sqlUpdate = `UPDATE users SET lastmessage = ? WHERE id = ?`;
                let dataUpdate = [now, row.id];
                db.run(sqlUpdate, dataUpdate, (err) => {
                  if(err) return console.error(err.message);
                });
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
