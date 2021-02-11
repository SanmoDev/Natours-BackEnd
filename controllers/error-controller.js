const AppError = require('../Utils/AppError');

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
		`Duplicate field value ${value[0]}. Please use another value.`,
		400
	);
};

module.exports = (err, req, res, next) => {
	err.statusCode = err.statusCode || 500;
	err.status = err.status || 'Unknown error occurred';

	if (process.env.NODE_ENV === 'development') sendErrorDev(err, res);

	if (process.env.NODE_ENV === 'production') {
		if (err.name === 'CastError') err = handleCastError(err);
		else if (err.name === 'ValidationError') err = handleValidationError(err);
		else if (err.code === 11000) err = handleDuplicateError(err);

		sendErrorProd(err, res);
	}
};
