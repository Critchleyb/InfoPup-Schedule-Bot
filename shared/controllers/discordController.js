const axios = require('axios');
const fetch = require('node-fetch');
const AppError = require('../utils/appError');
const databaseController = require('./databaseController');
const User = require('../../models/userModel');
const config = require('../../config.json');
const { logger } = require('../utils/logger');

const clientId = process.env.DISCORD_CLIENT_ID;
const clientSecret = process.env.DISCORD_CLIENT_SECRET;

const scope = `connections`;
const redirectURIencoded =
    process.env.NODE_ENV === 'production'
        ? `https%3A%2F%2Fwww.wolfmachina.com%2Foauth%2Fdiscord%2Fredirect`
        : 'http%3A%2F%2Flocalhost%3A8000%2Foauth%2Fdiscord%2Fredirect';
const redirectURI =
    process.env.NODE_ENV === 'production'
        ? `https://www.wolfmachina.com/oauth/discord/redirect`
        : 'http://localhost:8000/oauth/discord/redirect';
const states = new Map();

exports.getAuthLink = (state, userID) => {
    states[userID] = state;
    return `https://discord.com/api/oauth2/authorize?response_type=code&client_id=${process.env.DISCORD_CLIENT_ID}&scope=${scope}&state=${userID}:${state}&redirect_uri=${redirectURIencoded}&prompt=consent`;
};

exports.checkState = (userID, state) => {
    const check = states[userID] === state;
    states.delete(userID);
    return check;
};

exports.getToken = async function (code) {
    return new Promise((resolve, reject) => {
        const data = {
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'authorization_code',
            redirect_uri: redirectURI,
            code: code,
            scope: scope,
        };

        fetch('https://discord.com/api/oauth2/token', {
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
                reject(new AppError('Could not fetch Twitch Token', 500));
            });
    });
};

//GETS TWITCH ID, RETURNS -1 FOR UNAUTH, NULL FOR ERROR OR THE TWITCH ID IF SUCCESSFULL
exports.getTwitchConnection = (discordUserId) => {
    return new Promise((resolve, reject) => {
        databaseController
            .getUser(discordUserId)
            .then((user) => {
                axios
                    .get('https://discord.com/api/users/@me/connections', {
                        headers: {
                            Authorization: `${user.discordAuth.token_type} ${user.discordAuth.access_token}`,
                        },
                    })
                    .then((response) => {
                        const twitchID = response.data.find((connection) => {
                            return connection.type === 'twitch';
                        }).id;
                        if (!twitchID) reject(new AppError('Could not find connected twitch ID', 400));
                        resolve(twitchID);
                    })
                    .catch((error) => {
                        if (error.response.status === 401) {
                            console.warn(`401 for user ${discordUserId}, refreshing token`);
                            return reject(new AppError('Unauthorized', 401));
                        }
                        reject(new AppError('Could not get Discord Connections', 500));
                    });
            })
            .catch((err) => {
                reject(err);
            });
    });
};

exports.setCultistRole = async function (discordUserId) {
    const client = require('../../index');
    try {
        const guild = await client.guilds.fetch(config.guilds.wolf.id);
        const member = await guild.members.fetch(discordUserId);
        if (!member.roles.cache.has(config.guilds.wolf.roles.cultist)) {
            const role = await guild.roles.fetch(config.guilds.wolf.roles.cultist);
            member.roles.add(role);
        }
    } catch (error) {
        logger(error.message, true);
        return new AppError('Could not set Role', 500);
    }
};

exports.resetCultistRoles = async () => {
    const client = require('../../index');
    console.log('resetting all cultist roles...');
    try {
        const guild = await client.guilds.fetch(config.guilds.wolf.id, true, true);
        const role = await guild.roles.fetch(config.guilds.wolf.roles.cultist);
        const members = await User.find({ cultistRole: true });
        members.forEach(async (member) => {
            try {
                const discordUser = await guild.members.fetch(member.discordUserId);
                if (!discordUser) return;
                await discordUser.roles.remove(role);
                member.cultistRole = false;
                await member.save();
            } catch (error) {
                logger(error.message, true);
            }
        });
    } catch (error) {
        logger(error.message, true);
        return new AppError('Could not remove roles', 500);
    }
};

exports.refreshToken = async (discordUserId) => {
    return new Promise(async (resolve, reject) => {
        let response;
        databaseController.getUser(discordUserId).then((user) => {
            const data = {
                client_id: clientId,
                client_secret: clientSecret,
                grant_type: 'refresh_token',
                refresh_token: user.discordAuth.refresh_token,
                redirect_uri: redirectURI,
                scope: scope,
            };

            fetch('https://discord.com/api/oauth2/token', {
                method: 'POST',
                body: new URLSearchParams(data),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            })
                .then(async (res) => {
                    response = {
                        discordAuth: await res.json(),
                    };
                    return databaseController.updateUser(discordUserId, response);
                })
                .then(() => {
                    resolve();
                })
                .catch((err) => {
                    console.error(err);
                    reject(new AppError('Could not refresh Twitch Token', 500));
                });
        });
    });
};
