const AppError = require('../../shared/utils/appError');

module.exports = (day, toNumber) => {
    let dayToConvert = null;
    if (typeof day === 'string') {
        dayToConvert = day.toLowerCase();
    } else {
        dayToConvert = day;
    }

    let newDay = -1;

    if (toNumber === true) {
        switch (dayToConvert) {
            case 'sun':
            case 'sunday': {
                newDay = 0;
                break;
            }
            case 'mon':
            case 'monday': {
                newDay = 1;
                break;
            }
            case 'tue':
            case 'tues':
            case 'tuesday': {
                newDay = 2;
                break;
            }
            case 'wed':
            case 'weds':
            case 'wednesday': {
                newDay = 3;
                break;
            }
            case 'thu':
            case 'thur':
            case 'thurs':
            case 'thursday': {
                newDay = 4;
                break;
            }
            case 'fri':
            case 'friday': {
                newDay = 5;
                break;
            }
            case 'sat':
            case 'saturday': {
                newDay = 6;
                break;
            }
            default: {
                throw new AppError('Day Could Not be Converted', 400);
            }
        }
    } else {
        switch (dayToConvert) {
            case 0: {
                newDay = `Sunday`;
                break;
            }
            case 1: {
                newDay = `Monday`;
                break;
            }
            case 2: {
                newDay = `Tuesday`;
                break;
            }
            case 3: {
                newDay = `Wednesday`;
                break;
            }
            case 4: {
                newDay = `Thursday`;
                break;
            }
            case 5: {
                newDay = `Friday`;
                break;
            }
            case 6: {
                newDay = `Saturday`;
                break;
            }
            default: {
                throw new AppError('Day Could Not be Converted', 400);
            }
        }
    }
    return newDay;
};
