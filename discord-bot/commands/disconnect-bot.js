const botController = require('../../twitch-bot/botController');
const config = require('../../config.json');

module.exports = {
    name: 'disconnect-bot',
    userRestricted: config.users.restrictedUsers,
    description: 'Connects the bot to twitch chat and starts cultist checks',
    cooldown: 5,
    execute: async (message, args) => {
        try {
            botController.disconnect();
            botController.stopCultistCheck();
            message.channel.send('bot disconnected');
        } catch (error) {
            message.channel.send(error.message);
            console.error(error);
        }
    },
};
