const schedule = require('node-schedule');
const taskController = require('../controllers/taskController');
const config = require('../../config.json');
const specConstructor = require('../utils/specConstructor');
const databaseController = require('../../shared/controllers/databaseController');

module.exports = {
    name: 'reschedule',
    aliases: ['update'],
    description: 'Reschedules the ID',
    userRestricted: config.users.restrictedUsers,
    dmOnly: true,
    guildOnly: false,
    usage: `<id> <day> <time (HH:MM)>`,
    example: `!reschedule 1 mon 12:30`,
    args: true,
    execute: async (message, args) => {
        //CHECK IF THERE ARE 3 ARGS
        if (args.length != 3) return message.reply(`${config.prefix}${this.name} requires 3 arguments!`);

        //CHECK IF SECOND ARGUMENT IS HH:MM
        if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(args[2]))
            return message.channel.send(`Time must be in HH:MM format`);

        //SET TIME VARIABLES
        const [hour, minute] = args[2].split(':');

        //CREATE SPEC TO STORE IN CONTROLLER
        let spec;
        try {
            spec = specConstructor(args[1], hour, minute);
        } catch (error) {
            console.log(`Error caught in create-notification.js:\n${error}`);
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
        if (job === null) return message.channel.send(`ID not found`);

        //UPDATE JOB
        try {
            if (job.reschedule(rule)) {
                taskController.updateJob(+args[0], spec);
                taskController.updateNextCancelled(+args[0], false);
                await databaseController.upateSchedule(job.id, { spec, nextCancelled: false });
            } else throw 'Job could not be rescheduled';
            message.channel.send(`ID: ${args[0]} rescheduled to ${args[1]} at ${args[2]}`);
        } catch (err) {
            //WARN ON FAILURE
            message.channel.send(`Error: Post could need be rescheduled`);
            console.error(`Error caught in reschedule-notification.js`, err);
        }
    },
};
