const schedule = require('node-schedule');
const taskController = require('../controllers/taskController');
const sendNotification = require('./sendNotification');
const botController = require('../../twitch-bot/botController');
const databaseController = require('../../shared/controllers/databaseController');
const twitterController = require('../../shared/controllers/twitterController');
const discordController = require('../../shared/controllers/discordController');
const config = require('../../config.json');
const { logger } = require('../../shared/utils/logger');

module.exports = (oneTimeJob, rule, client) => {
    if (oneTimeJob) {
        return schedule.scheduleJob(rule, function () {
            logger(`Job ${this.id} running...`);
            //SET NEXT CANCELLED TO FALSE
            taskController.updateNextCancelled(this.id, false);

            //RESET CULTIST ROLES
            discordController
                .resetCultistRoles()
                .then(() => {
                    //DO CULTIST CHECK
                    botController.connect();
                    botController.startCultistCheck();
                })
                .catch((error) => logger(error, true));

            //AFTER CULTIST ADJUSTMENT TIME, SEND A POST
            setTimeout(async () => {
                botController.stopCultistCheck();
                botController.disconnect();
                sendNotification(config.guilds.wolf.channels.stream).catch((error) => logger(error.message, true));
                if (this.twitterPost) {
                    try {
                        await twitterController.postTweet(config.users.wolf);
                        logger(`Posted to twitter on Job ${this.id}`);
                    } catch (error) {
                        logger(`Error posting to twitter in Job: ${this.id}\n${error}`, true);
                    }
                }
            }, process.env.CULTIST_ADJUSTMENT * 60 * 1000);

            //REMOVE TASK FROM CONTROLLER
            databaseController.deleteSchedule(this.id).catch((err) => console.error(err));
            taskController.deleteJob(this.id);

            logger(`Job ${this.id} ended...`);

            //CANCEL THIS TASK
            this.cancel();
        });
    } else if (!oneTimeJob) {
        return schedule.scheduleJob(rule, function () {
            logger(`Job ${this.id} running...`);
            //SET NEXT CANCELLED TO FALSE
            taskController.updateNextCancelled(this.id, false);
            databaseController
                .upateSchedule(this.id, { nextCancelled: false })
                .catch((err) => logger(error.message, true));

            //RESET CULTIST ROLES
            discordController
                .resetCultistRoles()
                .then(() => {
                    //DO CULTIST CHECK
                    botController.connect();
                    botController.startCultistCheck();
                })
                .catch((error) => logger(error, true));

            //AFTER CULTIST ADJUSTMENT TIME, SEND A POST
            setTimeout(async () => {
                botController.stopCultistCheck();
                botController.disconnect();
                sendNotification(config.guilds.wolf.channels.stream).catch((error) => logger(error.message, true));
                if (this.twitterPost) {
                    try {
                        await twitterController.postTweet(config.users.wolf);
                        logger(`Posted to twitter on Job ${this.id}`);
                    } catch (error) {
                        logger(`Error posting to twitter in Job: ${this.id}\n${error}`, true);
                    }
                }
                logger(`Job ${this.id} ended...`);
            }, process.env.CULTIST_ADJUSTMENT * 60 * 1000);
        });
    }
};
