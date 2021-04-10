const { mods } = require('../utils/getMods');

module.exports = {
    name: 'awoo',
    aliases: ['a'],
    userRestricted: mods(),
    description: 'awoo!',
    cooldown: 5,
    execute: async (message, args) => {
        message.channel.send('Awoo!');
    },
};
