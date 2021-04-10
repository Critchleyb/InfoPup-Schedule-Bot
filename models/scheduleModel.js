const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    id: Number,
    spec: [Number],
    oneTime: Boolean,
    nextCancelled: {
        type: Boolean,
        default: false,
    },
    twitterPost: {
        type: Boolean,
        default: true,
    },
});

const Schedule = mongoose.model('Schedule', scheduleSchema);

module.exports = Schedule;
