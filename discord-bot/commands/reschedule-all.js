const taskController = require('../controllers/taskController');
const schedule = require('node-schedule');
const AppError = require('../../shared/utils/appError');
const databaseController = require('../../shared/controllers/databaseController');
const config = require('../../config.json');

module.exports = {
    name: 'reschedule-all',
    aliases: ['update-all', 'updateall'],
    description: 'Updates all schedules by the hour passed in. Can not reschedule outside of the set day',
    userRestricted: config.users.restrictedUsers,
    dmOnly: true,
    cooldown: 5,
    args: true,
    usage: `!reschedule-all <timeDiff>`,
    example: `!reschedule-all -1`,
    execute: async (message, args) => {
        timediff = +args[0];
        const jobs = taskController.getJobs();
        jobs.forEach(async (job) => {
            job.spec[1] = job.spec[1] + timediff; //SET NEW HOUR IN SPEC
            if (job.spec[1] < 0 || job.spec[1] > 23)
                return message.channel.send(
                    `ID: ${job.id} could not be rescheduled outside of it's set day, please use !reschedule ${job.id} to reschedule this job.`
                );

            //CREATE RECURRENCE RULE
            let rule = new schedule.RecurrenceRule();
            rule.dayOfWeek = job.spec[0];
            rule.hour = job.spec[1];
            rule.minute = job.spec[2];

            //RESCHEDULE JOB
            try {
                if (job.reschedule(rule)) {
                    taskController.updateJob(job.id, job.spec);
                    taskController.updateNextCancelled(job.id, false);
                    await databaseController.upateSchedule(job.id, { spec: job.spec, nextCancelled: false });
                } else throw new AppError('Job could not be rescheduled', 500);
                message.channel.send(`ID: ${job.id} rescheduled to ${job.nextInvocation()}`);
            } catch (err) {
                //WARN ON FAILURE
                console.error(err);
                return message.channel.send(`Error: Post could need be rescheduled`);
            }
        });
    },
};
