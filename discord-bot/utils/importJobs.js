const databaseController = require('../../shared/controllers/databaseController');
const taskController = require('../controllers/taskController');
const jobCreator = require('../utils/jobCreator');
const schedule = require('node-schedule');

module.exports = async () => {
    const client = require('../../index');

    let schedules = new Array();
    try {
        schedules = await databaseController.getSchedules();
    } catch (error) {
        return console.error(error);
    }
    schedules.forEach((returnedSchedule) => {
        //CREATE RECURRENCE RULE
        let rule = new schedule.RecurrenceRule();
        rule.dayOfWeek = returnedSchedule.spec[0];
        rule.hour = returnedSchedule.spec[1];
        rule.minute = returnedSchedule.spec[2];

        try {
            const job = jobCreator(returnedSchedule.oneTime, rule, client);

            //ADD JOB TO TASK CONTROLLER WITH SPEC
            taskController.addJob(job, returnedSchedule.spec, returnedSchedule.oneTime, returnedSchedule.id);
        } catch (error) {
            console.error(`Error caught in importJobs.js`, error);
        }
    });
};
