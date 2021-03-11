const AppError = require('../utils/AppError');

const sendErrorDev = (err, res) => {
	res.status(err.statusCode).json({
		status: err.status,
		error: err,
		message: err.message,
		stack: err.stack,
	});
};

const sendErrorProd = (err, res) => {
	//Erro operacional, pode informá-lo ao cliente
	if (err.isOperational) {
		res.status(err.statusCode).json({
			status: err.status,
			message: err.message,
		});
	}
	//Erro de código, não informá-lo ao cliente, apenas no console do host
	else {
		console.error('ERRO DE CÓDIGO:', err);
		res.status(500).json({
			status: 'error',
			message: 'An error has occurred',
		});
	}
};

const handleCastError = err =>
	new AppError(`${err.value} is not a valid ${err.path}`, 400);

const handleValidationError = err => {
	const errors = Object.values(err.errors).map(el => el.message);
	return new AppError(`Invalid input data. ${errors.join('. ')}`, 400);
};

const handleDuplicateError = err => {
	const value = err.errmsg.match(/"(.*?)"/);
	return new AppError(
		`Duplicate field value ${
			value ? value[0] : 'inputted'
		}. Please use another value.`,
		400
	);
};

const handleInvalidJWT = () =>
	new AppError('Invalid access request, please login again', 401);

const handleExpiredJWT = () =>
	new AppError('Your session has expired, please login again', 401);

module.exports = (err, req, res, next) => {
	err.statusCode = err.statusCode || 500;
	err.status = err.status || 'Unknown error occurred';

	if (process.env.NODE_ENV === 'development') sendErrorDev(err, res);

	if (process.env.NODE_ENV === 'production') {
		if (err.code === 11000) err = handleDuplicateError(err);
		else {
			switch (err.name) {
				case 'CastError':
					err = handleCastError(err);
					break;
				case 'ValidationError':
					err = handleValidationError(err);
					break;
				case 'JsonWebTokenError':
					err = handleInvalidJWT();
					break;
				case 'TokenExpiredError':
					err = handleExpiredJWT();
					break;
				default:
					break;
			}
		}
		sendErrorProd(err, res);
	}
};
