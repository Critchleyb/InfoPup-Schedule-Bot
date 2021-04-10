const schedule = require('node-schedule');
const taskController = require('../controllers/taskController');
const config = require('../../config.json');
const specConstructor = require('../utils/specConstructor');
const jobCreator = require('../utils/jobCreator');
const databaseController = require('../../shared/controllers/databaseController');

module.exports = {
    name: 'reschedule-next',
    aliases: ['updatenext'],
    description: 'Reschedules the next post by the ID',
    userRestricted: config.users.restrictedUsers,
    dmOnly: true,
    guildOnly: false,
    usage: `<id> <day> <time (HH:MM)>`,
    example: `!reschedulenext 1 mon 12:30`,
    args: true,
    execute: async (message, args, client) => {
        //CHECK IF THERE ARE 3 ARGS
        if (args.length != 3) return message.reply(`${config.prefix}${this.name} requires 3 arguments!`);

        //CHECK IF SECOND ARGUMENT IS HH:MM
        if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(args[2]))
            return message.channel.send(`Time must be in HH:MM format`);

        //SET TIME VARIABLES
        const time = args[2].split(':');

        //CREATE SPEC TO STORE IN CONTROLLER
        let spec;
        try {
            spec = specConstructor(args[1], time[0], time[1]);
        } catch (error) {
            console.log(`Error caught in rescheduleNext-notification.js:\n${error}`);
            return message.channel.send('Could not reschedule that post!');
        }

        //CREATE RECURRENCE RULE
        let rule = new schedule.RecurrenceRule();
        rule.dayOfWeek = spec[0];
        rule.hour = spec[1];
        rule.minute = spec[2];

        //GET JOB
        const job = taskController.getJob(+args[0]);

        //IF NO JOB RETURN AND NOTIFY
        if (job == null) return message.channel.send(`ID not found`);

        //CANCEL NEXT POST BY ID
        try {
            job.cancelNext(true);
            taskController.updateNextCancelled(+args[0], true);
            await databaseController.upateSchedule(job.id, { nextCancelled: true });
        } catch (err) {
            console.log(err);
            return message.channel.send(`Next post by ${args[0]} could not be cancelled`);
        }

        //CREATE ONE OFF POST
        try {
            const job = jobCreator(true, rule, client);

            //ADD JOB TO TASK CONTROLLER WITH SPEC
            const id = taskController.addJob(job, spec, true);
            await databaseController.createSchedule(id, spec, true);

            //NOTIFY CHANNEL
            message.channel.send(`Post adjusted once for ${args[1]} at ${args[2]}\nNew Post ID: ${id}`);
        } catch (err) {
            //WARN ON FAILURE
            message.channel.send(`Error: Post could need be scheduled`);
            console.error(`Error caught in create-notification.js`, err);
        }
    },
};
