const mongoose = require('mongoose');

const twitterAuthSchema = new mongoose.Schema({
    oauth_token: {
        type: String,
        required: [true, 'twitter auth requires oauth_token'],
    },
    oauth_token_secret: {
        type: String,
        required: [true, 'twitter auth requires oauth_token_secret'],
    },
});

const TwitterAuth = mongoose.model('TwitterAuth', twitterAuthSchema);

module.exports = { TwitterAuth, twitterAuthSchema };
