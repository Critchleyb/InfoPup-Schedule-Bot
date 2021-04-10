const discordController = require('../../shared/controllers/discordController');
const databaseController = require('../../shared/controllers/databaseController');
const { user } = require('../..');
const AppError = require('../../shared/utils/appError');
const config = require('../../config.json');

module.exports = {
    name: 'twitch-link',
    aliases: ['twitchlink'],
    description:
        'Attempts to refresh your twitch connection, requires you to have used !auth to allow the bot to see your discord connections',
    dmOnly: true,
    cooldown: 10,
    args: false,
    execute: async (message, args, client) => {
        let user, twitchConnection;
        try {
            user = await databaseController.getUser(message.author.id);
            if (!user.discordAuth) throw new AppError('User is not authorized', 400);
        } catch (error) {
            if (error.statusCode == 400)
                return message.channel.send(
                    "You haven't authorised this bot to access your connections\nPlease use !auth to authorize."
                );
            else {
                console.error(error);
                return message.channel.send('Could not get your twitch connections.');
            }
        }
        try {
            twitchConnection = await discordController.getTwitchConnection(message.author.id);
        } catch (error) {
            if (error.statusCode === 401) {
                await discordController.refreshToken(message.author.id).catch((err) => {
                    console.error(err);
                    return message.channel.send('I ran into an error, please contact an admin if this persists');
                });
                return message.channel.send(
                    'I ran into an error getting your connection, please try the command again'
                );
            }
            console.error(error);
            return message.channel.send(
                'Could not get your twitch connection.\nMake sure you have linked your twitch account in settings > connections and try again.'
            );
        }
        try {
            await user.updateOne({ twitchUserId: twitchConnection });
        } catch (error) {
            console.error(error);
            return message.channel.send('Could not store your Twitch ID. Please contact an admin');
        }

        return message.channel.send('Updated your twitch ID to your currently connected twitch account!');
    },
};
