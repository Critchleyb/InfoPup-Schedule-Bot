const taskController = require('../controllers/taskController');
const databaseController = require('../../shared/controllers/databaseController');
const config = require('../../config.json');

module.exports = {
    name: 'twitter-post',
    aliases: ['twpost', 'twitterPost'],
    description: 'Sets a Jobs Twitter Post to either true or false',
    userRestricted: config.users.restrictedUsers,
    dmOnly: false,
    guildOnly: false,
    usage: `<ID> <On/Off>`,
    example: `!twitter-post 1 off`,
    args: true,
    execute: async (message, args, client) => {
        //GET JOB
        const job = taskController.getJob(+args[0]);

        //IF NO JOB RETURN AND NOTIFY
        if (job == null) return message.channel.send(`ID not found`);

        let toggle;
        switch (args[1].toLowerCase()) {
            case 'on': {
                toggle = true;
                break;
            }
            case 'off': {
                toggle = false;
                break;
            }
            default: {
                message.channel.send('You need to specify on or off');
                break;
            }
        }

        try {
            await databaseController.upateSchedule(+args[0], { twitterPost: toggle });
            job.twitterPost = toggle;
        } catch (error) {
            console.error(error);
            return message.channel.send('There was an error updating that Job');
        }

        message.channel.send(`Job ID: ${job.id} twitter post ${args[1]}.`);
    },
};
