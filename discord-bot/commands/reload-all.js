const getMods = require('../utils/getMods');
const config = require('../../config.json');

module.exports = {
    name: 'reload-all',
    userRestricted: config.users.restrictedUsers,
    description: 'Reloads all commands.',
    dmOnly: true,
    cooldown: 5,
    args: false,
    execute: async (message, args) => {
        try {
            await getMods.loadMods();
        } catch (error) {
            return message.channel.send('Could not load mod list for resticted commands');
        }

        const commands = message.client.commands;

        commands.forEach((command) => {
            delete require.cache[require.resolve(`./${command.name}.js`)];

            try {
                const newCommand = require(`./${command.name}.js`);
                message.client.commands.set(newCommand.name, newCommand);
                message.channel.send(`Command \`${command.name}\` was reloaded!`);
            } catch (error) {
                console.error(error);
                message.channel.send(
                    `There was an error while reloading a command \`${command.name}\`:\n\`${error.message}\``
                );
            }
        });
        message.channel.send('All commands were reloaded!');
    },
};
