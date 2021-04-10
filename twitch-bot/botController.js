const tmi = require('tmi.js');
const databaseController = require('../shared/controllers/databaseController');
const discordController = require('../shared/controllers/discordController');
const config = require('../config.json');
const { logger } = require('../shared/utils/logger');

const username = config.twitchBot.username; //TODO I would prefer to store these in .env but it doesnt seem to work??
const password = config.twitchBot.password;
let cultistCheck = false;
let cultists = [];

async function onMessageHandler(target, context, msg, self) {
    if (self) return;

    if (cultistCheck) {
        if (cultists.indexOf(context.username) !== -1) return;
        try {
            const user = await databaseController.findUser({ twitchUserId: context['user-id'] });
            const discordUserId = user.discordUserId;
            await discordController.setCultistRole(discordUserId);
            user.cultistRole = true;
            await user.save();
            cultists.push(context.username);
        } catch (err) {
            if (err.statusCode === 400) {
                logger(`No twitch ID stored for ${context.username}`);
            } else return console.error(err);
        }
    }
}

async function onConnectedHandler(addr, port) {
    const discordClient = require('../index');
    const channel = await discordClient.channels.fetch(config.guilds.test.channels.logs);
    logger(`* Twitch Bot Connected to ${addr}:${port}`);
}

async function onDisconnectedHandler(reason) {
    const discordClient = require('../index');
    const channel = await discordClient.channels.fetch(config.guilds.test.channels.logs);
    logger(`* Twitch Bot Disconnected from chat: ${reason}`);
}

const opts = {
    identity: {
        username: username,
        password: password,
    },
    channels: ['wolfmachina'],
};

const client = new tmi.client(opts);

client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);
client.on('disconnected', onDisconnectedHandler);

exports.connect = async function () {
    try {
        await client.connect();
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
};

exports.startCultistCheck = () => {
    cultists = [];
    cultistCheck = true;
};

exports.stopCultistCheck = () => {
    cultistCheck = false;
};

exports.disconnect = async () => {
    try {
        await client.disconnect();
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
};
