const { PubSubClient } = require('twitch-pubsub-client');
const twitchApi = require('./api-client');

exports.connect = async function (discorduserID) {
    const apiClient = twitchApi.getApiClient(discorduserID);
    const pubSubClient = new PubSubClient();
    const userID = await pubSubClient.registerUserListener(apiClient);

    const listener = await pubSubClient.onRedemption(userID, (message) => {
        console.log(message._data.data);
    });
};
