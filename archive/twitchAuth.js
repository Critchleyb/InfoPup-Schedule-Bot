const twitchController = require('../../shared/controllers/twitchController');
const Discord = require('discord.js');

module.exports = {
    name: 'twitch-auth',
    aliases: ['twitchauth'],
    userRestricted: ['144518369645690882', process.env.DISCORD_WOLF_USERID],
    description: 'Authorizes the Bot to access your twitch channel point redemptions',
    cooldown: 60,
    execute(message, args, client) {
        const reply = new Discord.MessageEmbed()
            .setTitle('InfoPup Twitch Authorization Link')
            .setDescription(twitchController.getAuthLink(message.author.id))
            .setFooter('This is a one use link');

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
