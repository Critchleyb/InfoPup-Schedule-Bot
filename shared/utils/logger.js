const config = require('../../config.json');
let client, channel;

exports.init = async () => {
    client = require('../../index');
    channel = await client.channels.fetch(config.guilds.test.channels.logs).catch((error) => console.error(error));
};

exports.logger = (message, error) => {
    if (!error) {
        console.log(message);
        channel.send(message).catch((error) => console.error(error));
    } else if (error) {
        console.error(message);
        channel.send(`ERROR: ${message}`).catch((error) => console.error(error));
    }
};
