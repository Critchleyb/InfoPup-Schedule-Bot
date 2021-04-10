const botController = require('../../twitch-bot/botController');
const config = require('../../config.json');

module.exports = {
    name: 'connect-bot',
    userRestricted: config.users.restrictedUsers,
    description: 'Connects the bot to twitch chat and starts cultist checks',
    cooldown: 5,
    execute: async (message, args) => {
        try {
            botController.connect();
            botController.startCultistCheck();
            message.channel.send('bot connected');
        } catch (error) {
            message.channel.send(error.message);
            console.error(error);
        }
    },
};
