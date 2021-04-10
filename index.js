const dotenv = require('dotenv').config();
const config = require('./config.json');
const mongoose = require('mongoose');
const { logger } = require('./shared/utils/logger');
const botController = require('./twitch-bot/botController');

process.on('unhandledRejection', (err) => {
    logger(`!UNHANDLED REJECTION: ${err.message}`, true);
    console.error(err.name, err.message);
});

process.on('uncaughtException', (err) => {
    logger(`!UNCAUGHT EXCEPTION: ${err.message}`, true);
    console.error(err.name, err.message);
});

const importJobs = require('./discord-bot/utils/importJobs');
const getMods = require('./discord-bot/utils/getMods');
const { client, loadCommands } = require('./discord-bot/discordBot');
const app = require('./app');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`App running on port ${port} in ${process.env.NODE_ENV} mode`);
    mongoose
        .connect(DB, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
            useUnifiedTopology: true,
        })
        .then(() => {
            console.log('DB Connection Successful');
            importJobs();
            return client.login(config.discordToken);
        })
        .then(() => {
            module.exports = client;
            return getMods.loadMods();
        })
        .then(() => loadCommands())
        .then(() => {
            console.log('Discord Bot commands loaded');
        })
        .catch((err) => {
            console.error(err);
            process.exit();
        });
});
