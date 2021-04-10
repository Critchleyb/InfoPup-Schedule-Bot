const makeID = require('../../discord-bot/utils/makeID');
const fetch = require('node-fetch');
const axios = require('axios');
const AppError = require('../utils/appError');
const { logger } = require('../utils/logger');
const sendNotification = require('../../discord-bot/utils/sendNotification');
const config = require('../../config.json');

let retrying = false;

const states = new Map();

axios.interceptors.response.use(
    function (response) {
        return response;
    },
    async function (error) {
        const originalRequest = error.config;
        if (error.response.status === 401 && retrying == false) {
            let reply = undefined;
            await axios
                .post(
                    `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`
                )
                .then(async (response) => {
                    process.env.TWITCH_OAUTH = response.data.access_token;
                    logger('TWITCH_OAUTH Refreshed');
                    const retryRequest = { ...originalRequest };
                    retryRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
                    retrying = true;
                    return axios(retryRequest);
                })
                .then((response) => {
                    retrying = false;
                    reply = response;
                })
                .catch((err) => {
                    logger(err.message, true);
                    reject(new AppError('Could not refresh process.env.TWITCH_OAUTH', 500));
                    retrying = false;
                });
            return reply;
        }
    }
);

exports.getAuthLink = (authorID) => {
    const stateNonce = makeID(10);
    states[authorID] = stateNonce;
    return `https://api.twitch.tv/kraken/oauth2/authorize?response_type=code&client_id=${
        process.env.TWITCH_CLIENT_ID
    }&redirect_uri=${process.env.TWITCH_REDIRECT_URI}&state=${`${authorID}:${stateNonce}`}&scope=${
        process.env.TWITCH_SCOPE
    }`;
};

exports.getAccessToken = (code) => {
    return new Promise((resolve, reject) => {
        const data = {
            client_id: process.env.TWITCH_CLIENT_ID,
            client_secret: process.env.TWITCH_CLIENT_SECRET,
            grant_type: 'authorization_code',
            redirect_uri: process.env.TWITCH_REDIRECT_URI,
            code: code,
        };

        fetch('https://api.twitch.tv/kraken/oauth2/token', {
            method: 'POST',
            body: new URLSearchParams(data),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
            .then((res) => {
                resolve(res.json());
            })
            .catch((err) => {
                reject(new AppError('Could not get Token', 500));
            });
    });
};

exports.checkState = (userID, state) => {
    const check = states[userID] === state;
    states.delete(userID);
    return check;
};

exports.getChannelInfo = async () => {
    return new Promise((resolve, reject) => {
        axios
            .get(`https://api.twitch.tv/helix/channels?broadcaster_id=${process.env.CHANNEL_ID}`, {
                headers: {
                    Authorization: `Bearer ${process.env.TWITCH_OAUTH}`,
                    'client-id': process.env.TWITCH_CLIENT_ID,
                },
            })
            .then((response) => {
                const channelInfo = response.data.data[0];
                if (!channelInfo) reject(new AppError('No Channel Info Returned', 400));
                resolve(channelInfo);
            })
            .catch((err) => {
                logger(err.message, true);
                reject(new AppError('Could not Get Twitch Channel Info', 500));
            });
    });
};
