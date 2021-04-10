const twitchController = require('../../shared/controllers/twitchController');
const { logger } = require('../../shared/utils/logger');

module.exports = async function (channelID) {
    const client = require('../../index');

    const channel = await client.channels.fetch(channelID);

    const channelInfo = await twitchController.getChannelInfo();

    const message = `@everyone ${channelInfo.game_name}: ${
        channelInfo.title.split('|')[0]
    } https://www.twitch.tv/wolfmachina`;

    await channel.send(message);
};
