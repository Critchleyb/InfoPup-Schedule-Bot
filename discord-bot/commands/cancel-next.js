const AppError = require('../../shared/utils/appError');
const taskController = require('../controllers/taskController');
const databaseController = require('../../shared/controllers/databaseController');
const config = require('../../config.json');

module.exports = {
    name: 'cancel-next',
    aliases: ['cancelnext'],
    userRestricted: config.users.restrictedUsers,
    description: 'cancels the next scheduled post of the ID given',
    dmOnly: true,
    guildOnly: false,
    usage: `<id>`,
    example: `!cancel-next 1`,
    args: true,
    execute: async (message, args) => {
        //GET JOB
        const job = taskController.getJob(+args[0]);

        //IF NO JOB RETURN AND NOTIFY
        if (job == null) return message.channel.send(`ID not found`);

        //CANCELS NEXT POST
        try {
            job.cancelNext(true);

            //Update Next Cancelled, Throw if it cant
            if (!taskController.updateNextCancelled(+args[0], true)) throw new AppError('Could not update Job', 500);
            await databaseController.upateSchedule(job.id, { nextCancelled: true });

            //NOTIFY USER
            message.channel.send(`Next Post ID: ${args[0]} cancelled`);
        } catch (err) {
            console.error(err);
            return message.channel.send(`Could not cancel next post`);
        }
    },
};
