const databaseController = require('../../shared/controllers/databaseController');
const jobs = [];
let id;
databaseController
    .getNextScheduleID()
    .then((nextId) => (id = nextId))
    .catch((err) => {
        console.error('Error getting ID, setting to random number');
        id = 1 * (Math.random() * 1000);
    });

exports.addJob = (job, spec, oneTime, importedId) => {
    if (!importedId) {
        //SET ID
        job.id = id;
        id++;
    } else {
        job.id = importedId;
    }

    //SET TWITTER POST
    job.twitterPost = true;

    //SET SPEC
    job.spec = spec;

    //SET oneTime if true
    if (oneTime) {
        job.oneTime = true;
    } else {
        job.oneTime = false;
    }

    //SET TIMEOUT
    let timeout = process.env.CULTIST_ADJUSTMENT;
    timeout = timeout * 60 * 1000; //converts minutes to ms
    job.timeout = timeout;

    //SET NEXT CANCELLED
    job.nextCancelled = false;

    //PUSH INTO ARRAY
    jobs.push(job);

    //RETURN THE JOB
    return job.id;
};

exports.getJob = (id) => {
    job = jobs.find((el) => {
        return el.id === id;
    });
    return job;
};

exports.getJobs = () => {
    return jobs;
};

exports.deleteJob = (id) => {
    const jobIndex = jobs.findIndex((el) => {
        return el.id === id;
    });
    jobs.splice(jobIndex, 1);
};

exports.updateJob = (id, spec) => {
    const job = jobs.find((el) => {
        return el.id === id;
    });
    job.spec = spec;
};

//Updates The job's nextCancelled Property, Returns true if successful, False if not
exports.updateNextCancelled = (id, cancelled) => {
    const job = jobs.find((el) => {
        return el.id === id;
    });
    if (job) {
        job.nextCancelled = cancelled;
        return true;
    } else false;
};
