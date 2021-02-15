const jwt = require('jsonwebtoken');
const {promisify} = require('util');
const crypto = require('crypto');
const User = require('../models/user-model');
const globalCatch = require('../utils/GlobalCatch');
const AppError = require('../utils/AppError');
const sendEmail = require('../utils/Email');

const signToken = id =>
	jwt.sign({id}, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRE,
	});

const createSendToken = (user, statusCode, res) => {
	const token = signToken(user._id);

	const cookieOptions = {
		expires: new Date(
			Date.now() +
				parseInt(process.env.JWT_COOKIE_EXPIRE, 10) * 24 * 60 * 60 * 1000
		),
		secure: process.env.NODE_ENV === 'production',
		httpOnly: true,
	};

	res.cookie('jwt', token, cookieOptions);

	user.password = user.active = user.role = user.__v = undefined;

	res.status(statusCode).json({
		status: 'success',
		token,
		data: {
			user,
		},
	});
};

exports.signup = globalCatch(async (req, res, next) => {
	const user = await User.create({
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
		passwordConfirm: req.body.passwordConfirm,
	});
	//SEND CONFIRM TOKEN TO USER EMAIL
	const confirmToken = user.createEmailConfirmToken();
	await user.save({validateBeforeSave: false});

	const URL = `${req.protocol}://${req.get(
		'host'
	)}/api/users/confirmEmail/${confirmToken}`;

	const message = `Did you just create an account at Natours.com? Click the link below to confirm your email\n${URL}\nIf you didn't, please ignore this email`;

	try {
		await sendEmail({
			email: user.email,
			subject: 'Natours email confirmation token (valid for 10min)',
			message,
		});

		res.status(201).json({
			status: 'success',
			message: 'User created successfully, please confirm your email',
		});
	} catch (err) {
		user.emailConfirmToken = undefined;
		user.emailConfirmExpires = undefined;
		await user.save({validateBeforeSave: false});

		return next(
			new AppError(
				'There was an error sending the confirmation email, please try again later',
				500
			)
		);
	}
});

exports.confirmEmail = globalCatch(async (req, res, next) => {
	//GET USER FROM TOKEN
	const hashedToken = crypto
		.createHash('sha256')
		.update(req.params.token)
		.digest('hex');

	const user = await User.findOne({
		emailConfirmToken: hashedToken,
	});
	//IF TOKEN HASN'T EXPIRED AND USER IS VALID, SET NEW PW
	if (!user)
		return next(
			new AppError('Confirmation token is invalid or has expired', 400)
		);

	user.active = true;
	user.emailConfirmToken = undefined;
	user.emailConfirmExpires = undefined;
	await user.save({validateBeforeSave: false});
	//LOG USER IN
	createSendToken(user, 200, res);
});

exports.login = globalCatch(async (req, res, next) => {
	const {email, password} = req.body;
	if (!email || !password)
		return next(new AppError('Both email and password are needed', 400));

	const user = await User.findOne({email}).select('+password');
	if (!user || !(await user.correctPassword(password, user.password)))
		return next(new AppError('Incorrect email or password', 401));

	createSendToken(user, 200, res);
});

exports.protect = globalCatch(async (req, res, next) => {
	//CHECK IF TOKEN EXISTS AND IS VALID
	let token;
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer')
	)
		token = req.headers.authorization.split(' ')[1];

	if (!token) return next(new AppError('Please log in to get access.', 401));

	//CHECK IF USER EXISTS
	const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
	const user = await User.findById(decoded.id);

	if (!user) return next(new AppError('This user does not exist.', 401));

	//CHECK IF USER HAS CHANGED PASSWORD AFTER TOKEN WAS ISSUED
	if (user.passwordChanged(decoded.iat))
		return next(
			new AppError(
				"This user's password has been changed, please login again",
				401
			)
		);

	req.user = user;
	next();
});

exports.restrictTo = (...roles) => (req, res, next) => {
	if (!roles.includes(req.user.role))
		return next(
			new AppError('You do not have permission for this action', 403)
		);
	next();
};

exports.forgotPassword = globalCatch(async (req, res, next) => {
	//GET USER FROM EMAIL
	const user = await User.findOne({email: req.body.email});
	if (!user) return next(new AppError('No user found with that email', 404));
	//GENERATE RANDOM RESET TOKEN
	const resetToken = user.createPwResetToken();
	await user.save({validateBeforeSave: false});
	//SEND TOKEN TO USER EMAIL
	const resetURL = `${req.protocol}://${req.get(
		'host'
	)}/api/users/resetPassword/${resetToken}`;

	const message = `Forgot your password? Click the link below to reset it\n${resetURL}\nIf you didn't, please ignore this email`;

	try {
		await sendEmail({
			email: user.email,
			subject: 'Your password reset Token (valid for 10min)',
			message,
		});

		res.status(200).json({
			status: 'success',
			message: 'Token sent to email!',
		});
	} catch (err) {
		user.passwordResetToken = undefined;
		user.passwordResetExpires = undefined;
		await user.save({validateBeforeSave: false});

		return next(
			new AppError(
				'There was an error sending the email, please try again later',
				500
			)
		);
	}
});

exports.resetPassword = globalCatch(async (req, res, next) => {
	//GET USER FROM TOKEN
	const hashedToken = crypto
		.createHash('sha256')
		.update(req.params.token)
		.digest('hex');

	const user = await User.findOne({
		passwordResetToken: hashedToken,
		passwordResetExpires: {$gt: Date.now()},
	});
	//IF TOKEN HASN'T EXPIRED AND USER IS VALID, SET NEW PW
	if (!user)
		return next(
			new AppError('Confirmation token is invalid or has expired', 400)
		);
	user.password = req.body.password;
	user.passwordConfirm = req.body.passwordConfirm;
	user.passwordResetToken = undefined;
	user.passwordResetExpires = undefined;
	//UPDATE ChangedPasswordAt
	await user.save();
	//LOG USER IN
	createSendToken(user, 200, res);
});

exports.updatePassword = globalCatch(async (req, res, next) => {
	//GET USER FROM COLLECTION
	const user = await User.findById(req.user.id).select('+password');
	//CHECK IF POSTED PASSWORD IS CORRECT
	if (!(await user.correctPassword(req.body.passwordCurrent, user.password)))
		return next(new AppError('Wrong password input, please try again', 401));
	//UPDATE PASSWORD
	user.password = req.body.password;
	user.passwordConfirm = req.body.passwordConfirm;

	await user.save();
	//LOG USER IN
	createSendToken(user, 200, res);
});
