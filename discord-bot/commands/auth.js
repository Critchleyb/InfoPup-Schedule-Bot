const makeID = require('../utils/makeID');
const discordController = require('../../shared/controllers/discordController');
const Discord = require('discord.js');

module.exports = {
    name: 'auth',
    description: 'Authorizes the Bot to access your discord connections',
    cooldown: 60,
    execute(message, args) {
        const state = makeID(10);
        const reply = new Discord.MessageEmbed()
            .setTitle('InfoPup Discord Authorization')
            .setDescription(discordController.getAuthLink(state, message.author.id))
            .setFooter('This is a single use link');

        return message.author
            .send(reply)
            .then(() => {
                if (message.channel.type === 'dm') return;
                message.reply("I've sent you a DM with an auth link!");
            })
            .catch((error) => {
                console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
                message.reply("it seems like I can't DM you! Do you have DMs disabled?");
            });
    },
};
