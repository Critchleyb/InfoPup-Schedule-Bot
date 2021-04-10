const Discord = require('discord.js');
const config = require('../config.json');
const fs = require('fs');
const logger = require('../shared/utils/logger');

const prefix = process.env.NODE_ENV === 'production' ? config.prodPrefix : config.devPrefix;
console.log(`Prefix is ${prefix}`);

const client = new Discord.Client();
client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();

const loadCommands = () => {
    return new Promise((resolve, reject) => {
        const commandFiles = fs.readdirSync('./discord-bot/commands').filter((file) => file.endsWith('.js'));

        for (const file of commandFiles) {
            const command = require(`./commands/${file}`);
            client.commands.set(command.name, command);
        }
        resolve();
    });
};

client.on('ready', async () => {
    console.log('Discord Bot is connected');
    logger.init();
});

client.on('message', (message) => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command =
        client.commands.get(commandName) ||
        client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;
    if (command.private === true) return;

    if (command.dmOnly && message.channel.type !== 'dm') {
        return message.reply('I can only execute that command inside a DM!');
    }

    if (command.guildOnly && message.channel.type === 'dm') {
        return message.reply("I can't execute that command inside DMs!");
    }

    if (command.userRestricted) {
        if (command.userRestricted.indexOf(message.author.id) === -1) return;
    }

    if (command.args && !args.length) {
        let reply = `You didnt provide any arguments, ${message.author}!`;

        if (command.usage) {
            reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
        }

        return message.channel.send(reply);
    }

    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;

    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.reply(
                `please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`
            );
        }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    try {
        command.execute(message, args, client);
    } catch (error) {
        console.error(error);
        message.reply('there was an error trying to execute that command!');
    }
});

module.exports = { client, prefix, loadCommands };
