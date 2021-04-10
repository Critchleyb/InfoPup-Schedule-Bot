const config = require('../../config.json');
const schedule = require('node-schedule');

const taskController = require('../controllers/taskController');
const databaseController = require('../../shared/controllers/databaseController');
const specConstructor = require('../utils/specConstructor');
const jobCreator = require('../utils/jobCreator');

module.exports = {
    name: 'create-once',
    aliases: ['createonce'],
    userRestricted: config.users.restrictedUsers,
    description: 'schedules a one time live post and Cultist check.',
    dmOnly: true,
    guildOnly: false,
    usage: `<day> <HH:MM>`,
    example: `!createOnce tue 13:30`,
    args: true,
    execute: async (message, args, client) => {
        //MAKE SURE THERE ARE 2 ARGUMENTS
        if (args.length != 2) return message.reply(`${config.prefix}${this.name} requires 2 arguments!`);

        //CHECK IF SECOND ARGUMENT IS HH:MM
        if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(args[1]))
            return message.channel.send(`Time must be in HH:MM format`);

        //SET TIME VARIABLES
        const time = args[1].split(':');

        //CREATE SPEC
        let spec;
        try {
            spec = specConstructor(args[0], time[0], time[1]);
        } catch (error) {
            console.warn(`Error caught in createOnce-notification.js:\n${error}`);
            return message.channel.send('Could not schedule that post!');
        }

        //CREATE RECURRENCE RULE FROM SPEC
        let rule = new schedule.RecurrenceRule();
        rule.dayOfWeek = spec[0];
        rule.hour = spec[1];
        rule.minute = spec[2];

        //CREATE ONE TIME JOB
        try {
            const job = jobCreator(true, rule, client);

            //ADD JOB TO TASK CONTROLLER WITH SPEC
            const id = taskController.addJob(job, spec, true);
            await databaseController.createSchedule(id, spec, true);

            //NOTIFY CHANNEL
            message.channel.send(`Post scheduled once for ${args[0]} at ${args[1]}\nID: ${id}`);
        } catch (err) {
            //WARN ON FAILURE
            console.error(`Error caught in create-notification.js`, err);
            return message.channel.send(`Error: Post could need be scheduled`);
        }
    },
};
