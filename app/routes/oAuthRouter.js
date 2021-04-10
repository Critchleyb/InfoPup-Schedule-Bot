const express = require('express');
const oAuthController = require('../controllers/oAuthController');

const router = express.Router();

router.route('/twitter/redirect').get(oAuthController.twitterRedirect);
router.route('/discord/redirect').get(oAuthController.discordRedirect);
router.route('/twitch/redirect').get(oAuthController.twitchRedirect);

module.exports = router;
