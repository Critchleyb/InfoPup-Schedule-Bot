const twitterController = require('../../shared/controllers/twitterController');
const discordController = require('../../shared/controllers/discordController');
const twitchController = require('../../shared/controllers/twitchController');
const databaseController = require('../../shared/controllers/databaseController');
const fs = require('fs');
const AppError = require('../../shared/utils/appError');
const { logger } = require('../../shared/utils/logger');

const successHTML = fs.readFileSync(`${__dirname}/../templates/successTemplate.html`);

exports.twitterRedirect = async (req, res, next) => {
    if (!twitterController.verifyRequestToken(req.query.oauth_token)) {
        next(new AppError('oAuth token did not match', 500));
    }
    try {
        const [token, tokenSecret, discordUserId] = await twitterController.getAccessToken(
            req.query.oauth_token,
            req.query.oauth_verifier
        );
        const user = await databaseController.getUser(discordUserId);
        await user.updateOne({
            twitterAuth: {
                oauth_token: token,
                oauth_token_secret: tokenSecret,
            },
        });
    } catch (err) {
        next(new AppError('Internal server error', 500));
    }

    const responseHTML = successHTML.toString().replace('%MESSAGE%', '');
    res.status(200).end(responseHTML);
};

exports.discordRedirect = async function (req, res, next) {
    //SPLIT THE STATE INTO USERID AND STATE
    const [userID, state] = req.query.state.split(':');

    //CHECK THE STATE MATCHES WHAT IS EXPECTED
    if (!discordController.checkState(userID, state)) {
        next(new AppError('State did not match', 400));
    }
    try {
        //GET THE TOKEN FROM DISCORD
        const data = await discordController.getToken(req.query.code);

        //GET THE USER FROM THE DATABASE
        let user;
        user = await databaseController
            .getUser(userID)
            .catch(async () => (user = await databaseController.createUser(userID)));

        //STORE THE DISCORD AUTH
        await user.updateOne({ discordAuth: data });

        //GET THE USERS TWITCH CONNECTION ID TO STORE WITH THE DISCORD AUTH;
        const twitchID = await discordController
            .getTwitchConnection(userID)
            .catch((err) => console.warn(`Could not get Twitch Connection for user: ${userID}\n${err}`));
        //STORE THE TWITCH ID
        await user.updateOne({ twitchUserId: twitchID });

        //RESOLVE
        let responseHTML;
        if (twitchID) {
            responseHTML = successHTML.toString().replace('%MESSAGE%', '');
        } else {
            responseHTML = successHTML
                .toString()
                .replace(
                    '%MESSAGE%',
                    'Could not get your twitch ID, ensure you have linked your twitch account to your discord and then use !twitch-link to update your connection'
                );
        }

        res.status(200).end(responseHTML);
    } catch (err) {
        logger(err.message, true);
        next(new AppError('Error getting / storing token'), 500);
    }
};

exports.twitchRedirect = async function (req, res, next) {
    const [userID, state] = req.query.state.split(':');
    if (!twitchController.checkState(userID, state)) {
        next(new AppError('State did not match', 400));
    }
    try {
        //GET THE ACCESS TOKEN FROM TWITCH
        const data = await twitchController.getAccessToken(req.query.code);
        if (!data) {
            next(new AppError('Failed to get access token'), 400);
        }

        //GET THE USER FROM THE DATABASE
        let user = await databaseController.getUser(userID);
        if (!user) {
            //IF THERE IS NO USER, CREATE ONE
            user = await databaseController.createUser(userID);
        }

        //UPDATE THE USERS TWITCH AUTH
        await user.updateOne({ twitchAuth: data });

        //RESOLVE
        const responseHTML = successHTML.toString().replace('%MESSAGE%', '');
        res.status(200).end(responseHTML);
    } catch (err) {
        next('Error getting token', 500);
    }
};
