const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./controllers/error-controller');

const app = express();

//GLOBAL MIDDLEWARES
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

const limiter = rateLimit({
	max: 100,
	windowMs: 60 * 60 * 1000, //One hour
	message:
		'There were too many requests from your IP, please try again in an hour',
});

app.use(express.json());
app.use(express.static(`${__dirname}/public`));
app.use((req, res, next) => {
	req.requestTime = new Date().toISOString();
	next();
});

const tourRouter = require('./routes/tour-routes');
const userRouter = require('./routes/user-routes');
const AppError = require('./Utils/AppError');

app.use('/api', limiter);
app.use('/api/tours', tourRouter);
app.use('/api/users', userRouter);

app.all('*', (req, res, next) => {
	next(new AppError(`Couldn't find ${req.originalUrl} in this server`, 404));
});

app.use(errorHandler);

module.exports = app;
