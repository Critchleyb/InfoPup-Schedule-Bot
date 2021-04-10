Discord bot for WolfMachina.

Note, this code will not work without the proper .env & config.json. The code is only public to share my work and is not intended to be hosted elsewhere.

<h2>Usage</h2>
  <p>The bot is used to schedule live posts in discord, a twitter post, and sets a role for any users that speak in twitch chat within the 5 minutes before the stream.

In order for this to work properly, the stream will need to be manually started at the time set in schedule.

Jobs can either be set to run weekly (default) or as a one off.</p>

<h3>Schedule Commands</h3>
<p>These commands should be executed in a DM with the bot. They are restricted to users specified in the code.</p>

<h4>!view</h4>
<p>Shows a list of scheduled jobs.</p>

<h4>!view-next [id]</h4>
<p>Displays the time that a specified Job will start. This will be 5 minutes before the scheduled time as this is when the cultist check starts.</p>

<h4>!create [day] [HH:MM]</h4>
<p>Schedules a Weekly Job at the day and time specified. Day can be either short format (mon,tue,weds etc) or full day name.
  
The bot will reply with a Job ID</p>
   
<h4>!create-once [day] [HH:MM]</h4>
<p>Schedules a one time Job at the day and time specified. Day can be either short format (mon,tue,weds etc) or full day name.
  
The bot will reply with a Job ID</p>
  
<h4>!reschedule [ID] [day] [HH:MM]</h4>
<p>Changes the day / time a Job is set to run</p>

<h4>!reschedule-all [adjustment]</h4>
<p>Updates all scheduled jobs by a set time, time can be negative. For example !reschedule-all -1 will move all jobs back by one hour. This commands can not reschedule a job outside of its set day, for this you should update the command individually</p>

<h4>!reschedule-next [id] [day] [HH:MM]</h4>
<p>Cancels the next run of a job, and create a new one off job at the time specified. The Job will still run as normal the week after</p>

<h4>!cancel-next [id]</h4>
<p>Cancels the next run of a Job. The job will still run the week after.</p>

<h4>!delete [id]</h4>
<p>Deletes a Job.</p>

<h4>!twitter-post [id] [on/off]</h4>
<p>Turns the twitter post on / off for a job.</p>

# <<<<<<< HEAD

> > > > > > > b09b950fb6b0d9d83d84262681f331ba9729e84e

<h3>Authentication Commands</h3>

<h4>!twitter-auth</h4>
<p>DM's a link to authorize the bot to post to your twitter account. This command is restricted to users specified in the code.</p>

<h4>!auth</h4>
<p>DM's a link to authorize the bot to access your discord connections. This is required for the cultist role setting to work and is accessible to all users.</p>

# <<<<<<< HEAD

> > > > > > > b09b950fb6b0d9d83d84262681f331ba9729e84e

<h3>Misc Commands</h3>

<h4>!awoo</h4>
<p>The bot replys with "Awoo!". Used mainly for testing if the bot is alive.</p>

<h4>!send</h4>
<p>Instantly sends a live notification in discord. Used mainly for testing. This is restricted to users in the code.</p>

# <<<<<<< HEAD

> > > > > > > b09b950fb6b0d9d83d84262681f331ba9729e84e

<h3>Public Commands</h3>

<h4>!auth</h4>
<p>DM's a link to authorize the bot to access your discord connections. This is required for the cultist role setting to work and is accessible to all users.</p>

<h4>!help</h4>
<p>Shows a list of commands.</p>

<h4>!help [command]</h4>
<p>Shows more detailed help for a command.</p>

<h4>!twitch-link</h4>
<p>Updates the linked twitch.</p>

# <<<<<<< HEAD

> > > > > > > b09b950fb6b0d9d83d84262681f331ba9729e84e

<h3>oAuth Web Routes</h3>

<p>The application uses oauth to access discord connections, and post on twitter. This requires publicly accessible routes for the app to redirect to. The routes in use are:

oauth/twitter/redirect

oauth/discord/redirect</p>
