const jwt = require('jsonwebtoken');
const {promisify} = require('util');
const User = require('../models/user-model');
const globalCatch = require('../Utils/GlobalCatch');
const AppError = require('../Utils/AppError');

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
