const taskController = require('../controllers/taskController');
const Discord = require('discord.js');
const config = require('../../config.json');

const dayConverter = require('../utils/dayConverter');
const runTimeFromSpec = require('../utils/runTimeFromSpec');

module.exports = {
    name: 'view',
    description: 'Shows scheduled jobs.',
    userRestricted: config.users.restrictedUsers,
    dmOnly: true,
    guildOnly: false,
    example: '!view',
    args: false,
    execute: function (message, args, client) {
        //GET JOBS ARRAY
        const jobs = taskController.getJobs();

        //IF NO JOBS RETURN AND NOTIFY
        if (jobs.length === 0) return message.channel.send(`No Scheduled Posts!`);

        //SORT THE ARRAY BY DAY OF WEEK
        jobs.sort((a, b) => {
            let aDay, bDay;
            a.spec[0] === 0 ? (aDay = 7) : (aDay = a.spec[0]);
            b.spec[0] === 0 ? (bDay = 7) : (bDay = b.spec[0]);
            if (aDay < bDay) return -1;
            if (aDay > bDay) return 1;
            return 0;
        });

        const postTable = [];
        jobs.forEach((job) => {
            const runDate = runTimeFromSpec(job.spec);
            postTable.push(
                `| ${job.id} | ${dayConverter(runDate.getDay())} - ${runDate.getHours()}:${
                    runDate.getMinutes() < 10 ? `0${runDate.getMinutes()}` : runDate.getMinutes()
                } | ${job.nextCancelled} | ${job.oneTime === true ? 'Once' : 'Weekly'} | ${job.twitterPost} |\n`
            );
        });

        //CREATE REPLY
        const reply = new Discord.MessageEmbed()
            .setTitle('Scheduled Posts')
            .setDescription(`\`\`\`${postTable.join('')}\`\`\``)
            .setFooter(`| JOB ID | SCHEDULED TIME | NEXT POST CANCELLED | RECURRENCE | TWITTER POST |`);

        //SEND REPLY
        message.channel.send(reply);
    },
};
