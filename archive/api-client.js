const { ApiClient } = require('twitch');
const { RefreshableAuthProvider, StaticAuthProvider } = require('twitch-auth');
const databaseController = require('../shared/controllers/databaseController');

const clientId = process.env.TWITCH_CLIENT_ID;
const clientSecret = process.env.TWITCH_CLIENT_SECRET;

exports.getApiClient = (discordUserID) => {
    const oAuthData = databaseController.getTwitchAuth(discordUserID);
    console.log(oAuthData);
    if (!oAuthData) return;

    const accessToken = oAuthData.access_token;
    const refreshToken = oAuthData.refresh_token;

    const authProvider = new RefreshableAuthProvider(new StaticAuthProvider(clientId, accessToken), {
        clientSecret,
        refreshToken,
        onRefresh: (token) => {},
    });
    const apiClient = new ApiClient({ authProvider });

    return apiClient;
};
