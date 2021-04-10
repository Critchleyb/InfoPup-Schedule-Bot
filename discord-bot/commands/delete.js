const taskController = require('../controllers/taskController');
const databaseController = require('../../shared/controllers/databaseController');
const config = require('../../config.json');

module.exports = {
    name: 'delete',
    description: 'Deletes a scheduled Live post and Cultist Check',
    userRestricted: config.users.restrictedUsers,
    dmOnly: true,
    guildOnly: false,
    usage: '<id>',
    example: '!delete 1',
    private: false,
    args: true,
    execute: async function (message, args) {
        //GET JOB
        const job = taskController.getJob(+args[0]);

        //IF NO JOB RETURN AND NOTIFY
        if (job == null) return message.channel.send(`ID not found`);

        try {
            //CANCEL JOB
            job.cancel();

            //DELETE JOB FROM TASKCONTROLLER
            taskController.deleteJob(+args[0]);
            await databaseController.deleteSchedule(job.id);

            //NOTIFY DELETION
            message.channel.send(`Scheduled Post ID: ${job.id} deleted`);
        } catch (err) {
            console.error(err);
            return message.channel.send(`Could not delete Job`);
        }
    },
};
