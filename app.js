const express = require('express');
const morgan = require('morgan');
const AppError = require('./shared/utils/appError');
const globalErrorHandler = require('./app/controllers/errorController');

const oAuthRouter = require('./app/routes/oAuthRouter');

const app = express();

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
app.use(express.json());

app.use('/oauth', oAuthRouter);
app.all('/oauth/*', (req, res, next) => {
    next(new AppError(`URL: ${req.originalUrl} not found`, 404)); //If a param is used inside next(), it will always be considered an error.
});

app.use(globalErrorHandler);

module.exports = app;
