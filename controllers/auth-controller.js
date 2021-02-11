const jwt = require('jsonwebtoken');
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
		return next(new AppError('Email and password are needed', 400));

	const user = await User.findOne({email}).select('+password');
	if (!user || !(await user.correctPassword(password, user.password)))
		return next(new AppError('Incorrect email or password', 401));

	res.status(200).json({
		status: 'success',
		token: signToken(user._id),
	});
});
