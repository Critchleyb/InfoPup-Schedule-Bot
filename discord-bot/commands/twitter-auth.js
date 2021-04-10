const twitterController = require('../../shared/controllers/twitterController');
const Discord = require('discord.js');
const config = require('../../config.json');

module.exports = {
    name: 'twitter-auth',
    aliases: ['twauth'],
    description: 'Authorizes the app to post live notifications to your twitter account',
    userRestricted: config.users.restrictedUsers,
    cooldown: 5,
    execute: async function (message, args) {
        try {
            const [oauthToken] = await twitterController.getRequestToken(message.author.id);

            const reply = new Discord.MessageEmbed()
                .setTitle('InfoPup Twitter Authorization Link')
                .setDescription(`https://api.twitter.com/oauth/authorize?oauth_token=${oauthToken}`)
                .setFooter('This is a one use link');
            message.channel.send(reply);
        } catch (err) {
            console.error(err);
            message.channel.send('There was an error getting the auth token');
        }
    },
};
