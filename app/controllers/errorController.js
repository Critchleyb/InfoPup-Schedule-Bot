const fs = require('fs');

const failHTML = fs.readFileSync(`${__dirname}/../templates/failureTemplate.html`);

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    const responseHTML = failHTML.toString().replace('%ERRORMESSAGE%', err.message);

    res.status(err.statusCode).end(responseHTML);
};
