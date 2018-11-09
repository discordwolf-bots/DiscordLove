const reqEvent = (event) => require(`../events/${event}`);
module.exports = client => {
  client.on(`ready`, () => reqEvent(`ready`)(client));
  client.on(`message`, reqEvent(`message`));
  client.on(`messageDelete`, reqEvent(`messageDelete`));
  client.on(`guildMemberAdd`, reqEvent('guildMemberAdd'));
  client.on(`guildMemberRemove`, reqEvent('guildMemberRemove'));
  client.on(`error`, reqEvent(`error`));
  client.on(`messageDelete`, reqEvent(`messageDelete`));
  client.on('voiceStateUpdate', reqEvent(`voiceStateUpdate`));
}
