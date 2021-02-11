const express = require('express');
const morgan = require('morgan');
const errorHandler = require('./controllers/error-controller');

const app = express();

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.use(express.json());
app.use(express.static(`${__dirname}/public`));
app.use((req, res, next) => {
	req.requestTime = new Date().toISOString();
	next();
});

const tourRouter = require('./routes/tour-routes');
const userRouter = require('./routes/user-routes');
const AppError = require('./Utils/AppError');

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
	next(new AppError(`Couldn't find ${req.originalUrl} in this server`, 404));
});

app.use(errorHandler);

module.exports = app;
