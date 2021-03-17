const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const errorHandler = require('./controllers/ErrorController');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//SERVING STATIC FILES
app.use(express.static(path.join(__dirname, 'public')));

//SET SECURITY HTTP HEADERS
app.use(helmet());

//SET UP CORS
app.use(cors());

//DEV LOGGING
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

//LIMIT REQUESTS FROM SAME IP
const limiter = rateLimit({
	max: 100,
	windowMs: 60 * 60 * 1000, //One hour
	message:
		'There were too many requests from your IP, please try again in an hour',
});
app.use('/api', limiter);

//READ DATA FROM REQ.BODY
app.use(express.json({limit: '10kb'}));
app.use(express.urlencoded({extended: true, limit: '10kb'}));
app.use(cookieParser());

//DATA SANITIZATION AGAINST NoSQL QUERY INJECTION
app.use(mongoSanitize());

//DATA SANITIZATION AGAINST XSS
app.use(xss());

//PREVENT PARAMETER POLLUTION
app.use(
	hpp({
		whitelist: [
			'duration',
			'ratingsQuantity',
			'ratingsAverage',
			'maxGroupSize',
			'difficulty',
			'price',
		],
	})
);

//GET TIME OF REQUEST
app.use((req, res, next) => {
	req.requestTime = new Date().toISOString();
	next();
});

//ROUTES
const tourRouter = require('./routes/tour-routes');
const userRouter = require('./routes/user-routes');
const reviewRouter = require('./routes/review-routes');
const viewRouter = require('./routes/view-routes');
const AppError = require('./utils/AppError');

app.use('/', viewRouter);
app.use('/api/tours', tourRouter);
app.use('/api/users', userRouter);
app.use('/api/reviews', reviewRouter);

app.all('*', (req, res, next) => {
	next(new AppError(`Couldn't find ${req.originalUrl} in this server`, 404));
});

app.use(errorHandler);

module.exports = app;
