module.exports = (spec) => {
    let date = new Date(`2020`, `10`, spec[0] + 1, spec[1], spec[2]);
    const adjustment = process.env.CULTIST_ADJUSTMENT;
    date.setMinutes(date.getMinutes() + +adjustment);
    return date;
};
