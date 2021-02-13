const jwt = require('jsonwebtoken');
const {promisify} = require('util');
const crypto = require('crypto');
const User = require('../models/user-model');
const globalCatch = require('../Utils/GlobalCatch');
const AppError = require('../Utils/AppError');
const sendEmail = require('../Utils/Email');

const signToken = id =>
	jwt.sign({id}, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRE,
	});

exports.signup = globalCatch(async (req, res, next) => {
	const newUser = await User.create({
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
		passwordConfirm: req.body.passwordConfirm,
	});

	const token = signToken(newUser._id);

	res.status(201).json({
		status: 'success',
		token,
		data: {
			user: newUser,
		},
	});
});

exports.login = globalCatch(async (req, res, next) => {
	const {email, password} = req.body;
	if (!email || !password)
		return next(new AppError('Both email and password are needed', 400));

	const user = await User.findOne({email}).select('+password');
	if (!user || !(await user.correctPassword(password, user.password)))
		return next(new AppError('Incorrect email or password', 401));

	res.status(200).json({
		status: 'success',
		token: signToken(user._id),
	});
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
			new AppError('This password has been changed, please login again', 401)
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

exports.forgotPass = globalCatch(async (req, res, next) => {
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

	const message = `Forgot your password? Click this link below\n${resetURL}\nIf you didn't, please ignore this email`;

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

exports.resetPass = globalCatch(async (req, res, next) => {
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
	if (!user) return next(new AppError('Token is invalid or has expired', 400));
	user.password = req.body.password;
	user.passwordConfirm = req.body.passwordConfirm;
	user.passwordResetToken = undefined;
	user.passwordResetExpires = undefined;
	//UPDATE ChangedPasswordAt
	//user.passwordChangedAt = Date.now();
	await user.save();
	//LOG USER IN, SEND JWT
	const token = signToken(user._id);

	res.status(200).json({
		status: 'success',
		token,
	});
});
