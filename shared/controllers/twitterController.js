const databaseController = require('./databaseController');
const oauth = require('oauth');
const key = process.env.TWITTER_CONSUMER_KEY;
const secret = process.env.TWITTER_CONSUMER_SECRET;
const consumer = new oauth.OAuth(
    'https://api.twitter.com/oauth/request_token',
    'https://api.twitter.com/oauth/access_token',
    key,
    secret,
    '1.0A',
    'https://www.wolfmachina.com/oauth/twitter/redirect',
    'HMAC-SHA1'
);
const Twitter = require('twitter');
const twitchController = require('./twitchController');
const AppError = require('../utils/appError');

let lastToken = null;
let lastSecret = null;
let lastDiscordUserId = null;

exports.getRequestToken = async function (discordUserId) {
    return new Promise((resolve, reject) => {
        consumer.getOAuthRequestToken(function (err, oauthToken, oauthSecret, results) {
            if (err) {
                reject(new AppError('Could not get oAuth Token', 500));
            } else {
                lastToken = oauthToken;
                lastSecret = oauthSecret;
                lastDiscordUserId = discordUserId;
                resolve([oauthToken, oauthSecret]);
            }
        });
    });
};

exports.verifyRequestToken = (token) => {
    return token === lastToken;
};

exports.getAccessToken = async function (oauthToken, oauthVerifier) {
    return new Promise((resolve, reject) => {
        consumer.getOAuthAccessToken(oauthToken, lastSecret, oauthVerifier, async function (err, token, tokenSecret) {
            if (err) {
                reject(new AppError('Could not get access token', 500));
            }
            resolve([token, tokenSecret, lastDiscordUserId]);
        });
    });
};

exports.postTweet = async (discordUserId) => {
    return new Promise(async (resolve, reject) => {
        let client = null;
        databaseController
            .getUser(discordUserId)
            .then((user) => {
                if (!user.twitterAuth) reject(new AppError('No Twitter Auth for Specified User', 400));
                client = new Twitter({
                    consumer_key: process.env.TWITTER_CONSUMER_KEY,
                    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
                    access_token_key: user.twitterAuth.oauth_token,
                    access_token_secret: user.twitterAuth.oauth_token_secret,
                });
                return twitchController.getChannelInfo();
            })
            .then((channelInfo) => {
                const message = `${channelInfo.game_name}: ${
                    channelInfo.title.split('|')[0]
                } https://www.twitch.tv/wolfmachina`;

                client.post(
                    'statuses/update',
                    {
                        status: message,
                    },
                    (error, tweet, response) => {
                        if (error) {
                            console.log(error[0].message);
                            reject(new AppError('Could not Post Tweet', 500));
                        }
                        resolve();
                    }
                );
            })
            .catch((err) => reject(err));
    });
};
