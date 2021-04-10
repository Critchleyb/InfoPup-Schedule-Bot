const mongoose = require('mongoose');

const { discordAuthSchema } = require('./discordAuthModel');
const { twitterAuthSchema } = require('./twitterAuthModel');
const { twitchAuthSchema } = require('./twitchAuthModel');

const userSchema = new mongoose.Schema({
    discordUserId: {
        type: String,
        required: [true, 'A Discord User ID is required'],
        trim: true,
        unique: true,
    },
    cultistRole: Boolean,
    twitchUserId: String,
    discordAuth: discordAuthSchema,
    twitchAuth: twitchAuthSchema,
    twitterAuth: twitterAuthSchema,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
