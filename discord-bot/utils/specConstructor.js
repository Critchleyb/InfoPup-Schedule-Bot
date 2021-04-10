const dayConverter = require('./dayConverter');

module.exports = (day, hour, min) => {
    let dayOfWeek = dayConverter(day, true);

    const adjustment = process.env.CULTIST_ADJUSTMENT; // 5 Minutes in Milliseconds

    const date = new Date(`2020`, `10`, dayOfWeek + 1, hour, min); // THIS IS DUMB. Sunday in Nov is 1st. So if dayconverter returns 0, it adds 1 to make it a sunday, 5 + 1 is the 6th which is a saturday and so on

    date.setMinutes(date.getMinutes() - adjustment);

    const specHour = date.getHours();
    const specMinute = date.getMinutes();
    const specDayOfWeek = date.getDay();

    return [specDayOfWeek, specHour, specMinute];
};
