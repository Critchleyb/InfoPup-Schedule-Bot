const mongoose = require('mongoose');

const twitchAuthSchema = new mongoose.Schema({
    access_token: {
        type: String,
        required: [true, 'twitch auth requires access_token'],
    },
    refresh_token: {
        type: String,
        required: [true, 'twitch auth requires refresh_token'],
    },
    expires_in: {
        type: Number,
        required: [true, 'twitch auth requires expires_in'],
    },
    scope: {
        type: Array,
    },
    token_type: {
        type: String,
        required: [true, 'twitch auth requires token_type'],
    },
});

const TwitchAuth = mongoose.model('TwitchAuth', twitchAuthSchema);

module.exports = { TwitchAuth, twitchAuthSchema };
