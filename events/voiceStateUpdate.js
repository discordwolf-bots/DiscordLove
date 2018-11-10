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

Number.prototype.format = function(n, x) {
  var re = '(\\d)(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
  return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$1,');
};

const achieve_chatting = (client, row, member) => {
  let voiceTime = row.voicetime;
  let voiceTime_progress = row.achieve_chats_a_lot;
  let achieved = 0;

  let author = member.guild.members.get(row.id);

  for(let i=0; i<config.thresh_chats_a_lot.length; i++){
    if(fish_caught >= parseInt(config.thresh_chats_a_lot.split(',')[i]))
      if(voiceTime_progress < i+1)
        achieved = i+1;
  }
  if(achieved > 0){
    let rewards = 0;
    for(let i=voiceTime_progress;i<=achieved;i++){
      for(let j=1; j<=config.thresh_chats_a_lot.length; j++){
        if(i == j) rewards += parseInt(config.rewards.split(',')[j-1]);
      }
    }
    let embed = new Discord.RichEmbed()
      .setColor('#4DBF42')
      .setAuthor(`Achievement Gained! - \$${rewards} added!`, author.user.avatarURL)
      .setFooter(`Gained ${achieved-voiceTime_progress} Levels on the Chats a Lot achievement`);
    client.channels.get('505133836280266752').send(embed);
    let newBalance = row.money + rewards;
    client.channels.get(config.logging).send(`:speaker: ACHIEVEMENT CHATS A LOT : ${author.user.username}#${author.user.discriminator} - ${row.money} -> ${newBalance}`);
    let sqlUpdate = `UPDATE users SET money = ${newBalance}, achieve_chats_a_lot = ${achieved} WHERE id = ${row.id}`;
    db.run(sqlUpdate, (err) => {
      if(err) return console.error(err.message);
    });
  }
}

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
    if(!row) return;

    if(newUserChannel === '507329576398225408' && oldUserChannel !== undefined){
      // User joined AFK
      let timePassed = now - row.voicejoined;
      timePassed /= 1000;
      let validTime = Math.floor(timePassed / 60); // How many minutes

      if(validTime == 0) return;

      let min = 10;
      let max = 20;
      let toAdd = 0;
      for(let i=1; i<=validTime; i++){
        let random = Math.floor(Math.random() * (max-min)) + min;
        toAdd += random;
      }

      let balance = row.money;
      //let newBalance = balance + toAdd;
      let newBalance = balance;

      client.channels.get(config.logging).send(`:mega: VOICE CHAT : ${oldMember.guild.member(row.id).user.username}#${oldMember.guild.members.get(row.id).user.discriminator} - ${row.money} -> ${newBalance}  **(${validTime} minutes)**`);

      let sql2 = `UPDATE users SET voiceJoined = 0, money = ${newBalance}, voicetime = ${row.voicetime + validTime} WHERE id = ${row.id}`;
      db.run(sql2, (err) => {
        if(err) return console.error(err.message);
        achieve_chatting(client, row, newMember);
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

        client.channels.get(config.voice).send(`:x: ${oldMember.guild.member(row.id).user.username}#${oldMember.guild.members.get(row.id).user.discriminator} - **(${validTime} minutes)**`);

        let balance = row.money;
        //let newBalance = balance + toAdd;
        let newBalance = balance;

        client.channels.get(config.logging).send(`:mega: VOICE CHAT : ${oldMember.guild.member(row.id).user.username}#${oldMember.guild.members.get(row.id).user.discriminator} - ${row.money} -> ${newBalance} **(${validTime} minutes)**`);

        let sql2 = `UPDATE users SET voicejoined = 0, money = ${newBalance}, voicetime = ${row.voicetime + validTime} WHERE id = ${row.id}`;
        db.run(sql2, (err) => {
          if(err) return console.error(err.message);
          achieve_chatting(client, row, newMember);
        });
      }


    } else if(oldUserChannel !== undefined && newUserChannel != undefined){
      // User switches VC
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

        client.channels.get(config.voice).send(`:performing_arts: ${oldMember.guild.member(row.id).user.username}#${oldMember.guild.members.get(row.id).user.discriminator} - **(${validTime} minutes)**`);

        let balance = row.money;
        //let newBalance = balance + toAdd;
        let newBalance = balance;

        client.channels.get(config.logging).send(`:mega: VOICE CHAT SWITCH : ${oldMember.guild.member(row.id).user.username}#${oldMember.guild.members.get(row.id).user.discriminator} - ${row.money} -> ${newBalance} **(${validTime} minutes)**`);

        let sql2 = `UPDATE users SET voicejoined = ${now}, money = ${newBalance}, voicetime = ${row.voicetime + validTime} WHERE id = ${row.id}`;
        db.run(sql2, (err) => {
          if(err) return console.error(err.message);
          achieve_chatting(client, row, newMember);
        });
      }
    }


  });



}
