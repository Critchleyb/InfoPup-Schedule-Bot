const taskController = require('../controllers/taskController');
const config = require('../../config.json');

module.exports = {
    name: 'view-next',
    aliases: ['viewnext'],
    description: 'View the next time an ID will post',
    userRestricted: config.users.restrictedUsers,
    dmOnly: true,
    guildOnly: false,
    usage: `<id>`,
    example: `!view-next 1`,
    args: true,
    execute(message, args) {
        //GET JOB
        const job = taskController.getJob(+args[0]);

        //IF NO JOB RETURN AND NOTIFY
        if (job == null) return message.channel.send(`ID not found`);

        //GETS DATE OF NEXT POST
        let next = job.nextInvocation()._date.toString();

        //REPLIES
        message.channel.send(`ID: ${args[0]} will next post at ${next}`);
    },
};
