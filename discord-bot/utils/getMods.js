const AppError = require('../../shared/utils/appError');
const config = require('../../config.json');

let mods = [];

exports.loadMods = () => {
    const client = require('../../index');

    return new Promise((resolve, reject) => {
        let guild;
        client.guilds
            .fetch(config.guilds.wolf.id)
            .then((returnedGuild) => {
                guild = returnedGuild;
                return guild.members.fetch();
            })
            .then(() => guild.roles.fetch(config.guilds.wolf.roles.mod))
            .then((role) => {
                modArray = role.members.map((member) => member.id);
                if (modArray.indexOf(config.users.wolf) === -1) modArray.push(config.users.wolf);
                if (modArray.indexOf(config.users.critch) === -1) modArray.push(config.users.critch);
                mods = modArray;
                resolve();
            })
            .catch((err) => reject(new AppError(err.message, 500)));
    });
};

exports.mods = () => mods;
