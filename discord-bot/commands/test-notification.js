const sendNotification = require('../utils/sendNotification');
const config = require('../../config.json');

module.exports = {
    name: 'test-notification',
    aliases: ['sendTest'],
    userRestricted: config.users.restrictedUsers,
    description: 'Sends a test notification!',
    cooldown: 5,
    execute: async (message, args) => {
        try {
            sendNotification(config.guilds.test.channels.general);
            message.channel.send('Test Sent');
        } catch (error) {
            console.error(error);
        }
    },
};
