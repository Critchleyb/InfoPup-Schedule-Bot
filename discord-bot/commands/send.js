const sendNotification = require('../utils/sendNotification');
const { mods } = require('../utils/getMods');
const config = require('../../config.json');

module.exports = {
    name: 'send',
    description: 'Instantly sends a stream notification',
    userRestricted: mods(),
    dmOnly: true,
    guildOnly: false,
    example: '!send',
    args: false,
    private: false,
    execute: function (message, args, client) {
        sendNotification(config.guilds.wolf.channels.stream).catch((err) => console.error(error));
    },
};
