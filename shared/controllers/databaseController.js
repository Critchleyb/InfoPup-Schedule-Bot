const User = require('../../models/userModel');
const AppError = require('../utils/appError');
const Schedule = require('../../models/scheduleModel');

exports.createUser = async function (discordUserId) {
    return new Promise((resolve, reject) => {
        User.create({ discordUserId: discordUserId })
            .then((user) => {
                resolve(user);
            })
            .catch((err) => {
                reject(new AppError('Could not create user in database', 500));
            });
    });
};

exports.getUser = async function (discordUserId) {
    return new Promise((resolve, reject) => {
        User.findOne({ discordUserId })
            .then((user) => {
                if (!user) reject(new AppError('Could not find user', 400));
                resolve(user);
            })
            .catch(() => {
                reject(new AppError('Could not fetch user from database', 500));
            });
    });
};

exports.findUser = async function (filter) {
    return new Promise((resolve, reject) => {
        User.findOne(filter)
            .then((user) => {
                if (!user) reject(new AppError('Could not find user', 400));
                resolve(user);
            })
            .catch((err) => {
                reject(new AppError('Could not fetch user from database', 500));
            });
    });
};

exports.updateUser = async function (discordUserId, valueToUpdate) {
    return new Promise((resolve, reject) => {
        User.updateOne({ discordUserId: discordUserId }, valueToUpdate, { runValidators: true })
            .then((response) => {
                if (response.ok === 0) {
                    console.error(response);
                    reject(new AppError('Could not update user', 400));
                }
                resolve(true);
            })
            .catch((err) => {
                console.error(err);
                reject(new AppError('Could not update User', 500));
            });
    });
};

exports.createSchedule = async (id, spec, oneTime) => {
    return new Promise((resolve, reject) => {
        Schedule.create({
            id,
            spec,
            oneTime,
        })
            .then((response) => {
                resolve(response);
            })
            .catch((err) => {
                console.error(err);
                reject(new AppError('Could not create Schedule in DB', 500));
            });
    });
};

exports.getSchedules = async () => {
    return new Promise((resolve, reject) => {
        Schedule.find((err, schedules) => {
            if (err) reject(new AppError('Could not get schedules', 500));
            resolve(schedules);
        });
    });
};

exports.upateSchedule = async (id, valuesToUpdate) => {
    return new Promise((resolve, reject) => {
        Schedule.updateOne({ id }, valuesToUpdate, { runValidators: true }, (err, update) => {
            if (err) {
                reject(new AppError('Could not update Schedule', 500));
            }
            resolve(update);
        });
    });
};

exports.deleteSchedule = async (id) => {
    return new Promise((resolve, reject) => {
        Schedule.deleteOne({ id }, (err) => {
            if (err) {
                reject(new AppError('Could not delete Schedule', 500));
            }
            resolve();
        });
    });
};

exports.getNextScheduleID = async () => {
    return new Promise((resolve, reject) => {
        Schedule.findOne()
            .sort('-id')
            .then((schedule) => {
                if (!schedule) return resolve(1);
                resolve(schedule.id + 1);
            })
            .catch((err) => {
                console.log(err);
                reject(new AppError('Error getting ID', 500));
            });
    });
};
