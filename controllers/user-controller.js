const AppError = require('../utils/AppError');
const User = require('../models/user-model');
const globalCatch = require('../utils/GlobalCatch');

const filterObj = (obj, ...allowed) => {
	const newObj = {};
	Object.keys(obj).forEach(el => {
		if (allowed.includes(el)) newObj[el] = obj[el];
	});

	return newObj;
};

exports.getAllUsers = globalCatch(async (req, res, next) => {
	const users = await User.find().select('-__v');

	res.status(200).json({
		status: 'success',
		requestedAt: req.requestTime,
		results: users.length,
		data: {
			users,
		},
	});
});

exports.updateSelf = globalCatch(async (req, res, next) => {
	//ERROR IF USER POSTS PASSWORD
	if (req.body.password || req.body.passwordConfirm)
		return next(
			new AppError(
				'This page is not for updating the password, for that use api/users/updatePassword',
				400
			)
		);
	//FILTER OUT UNAUTHORIZED UPDATE FIELDS
	const filteredBody = filterObj(req.body, 'name', 'email');
	//UPDATE USER DOCUMENT
	const user = await User.findByIdAndUpdate(req.user.id, filteredBody, {
		new: true,
		runValidators: true,
	});

	res.status(200).json({
		status: 'success',
		data: {user},
	});
});

exports.deleteSelf = globalCatch(async (req, res, next) => {
	await User.findByIdAndUpdate(req.user.id, {active: false});

	res.status(204).json({
		status: 'success',
		data: null,
	});
});

exports.getUser = globalCatch(async (req, res, next) => {
	const user = await User.findById(req.params.id);

	res.status(200).json({
		status: 'success',
		data: {user},
	});
});

exports.createUser = globalCatch(async (req, res, next) => {
	const newUser = await User.create({...req.body});

	res.status(201).json({
		status: 'success',
		requestedAt: req.requestTime,
		data: {newUser},
	});
});

exports.updateUser = globalCatch(async (req, res, next) => {
	const user = await User.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});

	res.status(200).json({
		status: 'success',
		data: {user},
	});
});

// exports.deleteUser = ({requestTime}, res) => {
// 	res.status(204).json({
// 		status: 'success',
// 		requestedAt: requestTime,
// 		data: null,
// 	});
// };
