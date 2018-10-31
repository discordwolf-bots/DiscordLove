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
  console.log(`Connected to DB - Voice State Update`);
});

module.exports = (oldMember, newMember) => {
  let guild = oldMember.guild;
  let client = oldMember.client;

  let newUserChannel = newMember.voiceChannel;
  let oldUserChannel = oldMember.voiceChannel;

  let now = moment().format('x');
  console.log(now);

  let sql = `SELECT * FROM users WHERE id = ${oldMember.id}`;

  db.get(sql, (err, row) => {
    if(err) return console.error(err.message);

    if(newUserChannel === '507329576398225408' && oldUserChannel !== undefined){
      // User joined AFK
      let timePassed = now - row.voicejoined;
      timePassed /= 1000;
      let validTime = Math.floor(timePassed / 60); // How many minutes

      console.log(`TP: ${timePassed}`);
      console.log(`VT: ${validTime}`);

      if(validTime == 0) return;

      let min = 10;
      let max = 20;
      let toAdd = 0;
      for(let i=1; i<=validTime; i++){
        let random = Math.floor(Math.random() * (max-min)) + min;
        toAdd += random;
      }

      let balance = row.money;
      let newBalance = balance + toAdd;

      client.channels.get(config.logging).send(`:mega: VOICE CHAT : ${oldMember.guild.member(row.id).user.username}#${oldMember.guild.members.get(row.id).user.discriminator} - ${row.money} -> ${newBalance}  **(${validTime} minutes)**`);

      let sql2 = `UPDATE users SET voiceJoined = 0, money = ${newBalance}, voicetime = ${row.voicetime + validTime} WHERE id = ${row.id}`;
      db.run(sql2, (err) => {
        if(err) return console.error(err.message);
      });
    } else if(oldUserChannel === undefined && newUserChannel !== undefined){
      // User joins channel
      let sql2 = `UPDATE users SET voicejoined = ${now} WHERE id = ${row.id}`;
      client.channels.get(config.voice).send(`:white_check_mark: ${oldMember.guild.member(row.id).user.username}#${oldMember.guild.members.get(row.id).user.discriminator} - ${newUserChannel.name}`);
      db.run(sql2, (err) => {
        if(err) return console.error(err.message);
      });
    } else if(newUserChannel === undefined){
      // User leaves channel
        client.channels.get(config.voice).send(`:x: ${oldMember.guild.member(row.id).user.username}#${oldMember.guild.members.get(row.id).user.discriminator} - ${newUserChannel.name}  **(${validTime} minutes)**`);
      if(row.voicejoined != 0){

        let timePassed = now - row.voicejoined;
        timePassed /= 1000;
        let validTime = Math.floor(timePassed / 60); // How many minutes

        console.log(validTime);

        let min = 10;
        let max = 20;
        let toAdd = 0;

        if(validTime == 0) return;

        for(let i=1; i<=validTime; i++){
          let random = Math.floor(Math.random() * (max-min)) + min;
          toAdd += random;
        }

        let balance = row.money;
        let newBalance = balance + toAdd;

        client.channels.get(config.logging).send(`:mega: VOICE CHAT : ${oldMember.guild.member(row.id).user.username}#${oldMember.guild.members.get(row.id).user.discriminator} - ${row.money} -> ${newBalance} **(${validTime} minutes)**`);

        let sql2 = `UPDATE users SET voicejoined = 0, money = ${newBalance}, voicetime = ${row.voicetime + validTime} WHERE id = ${row.id}`;
        db.run(sql2, (err) => {
          if(err) return console.error(err.message);
        });
      }
    }
  });



}
