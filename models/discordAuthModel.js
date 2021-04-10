const mongoose = require('mongoose');

const discordAuthSchema = new mongoose.Schema({
    access_token: {
        type: String,
        required: [true, 'discord auth requires access_token'],
    },
    token_type: {
        type: String,
        required: [true, 'discord auth requires token_type'],
    },
    expires_in: {
        type: [Number, 'expires_in must be a number'],
        required: [true, 'discord auth requires expires_in'],
    },
    refresh_token: {
        type: String,
        required: [true, 'discord auth requires refresh_token'],
    },
    scope: {
        type: String,
    },
});

const DiscordAuth = mongoose.model('DiscordAuth', discordAuthSchema);

module.exports = { DiscordAuth, discordAuthSchema };
