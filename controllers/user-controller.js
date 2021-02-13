const AppError = require('../Utils/AppError');
const User = require('../models/user-model');
const globalCatch = require('../Utils/GlobalCatch');

const filterObj = (obj, ...allowed) => {
	const newObj = {};
	Object.keys(obj).forEach(el => {
		if (allowed.includes(el)) newObj[el] = obj[el];
	});

	return newObj;
};

exports.getAllUsers = globalCatch(async (req, res, next) => {
	const users = await User.find();

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

// exports.getUser = ({user, requestedTime}, res) => {
// 	res.status(200).json({
// 		status: 'success',
// 		requestedAt: requestedTime,
// 		data: {
// 			user,
// 		},
// 	});
// };
//
// exports.createUser = ({body, requestTime}, res) => {
// 	const newUser = {
// 		id: users[users.length - 1].id + 1,
// 		...body,
// 	};
// 	users.push(newUser);
//
// 	fs.writeFile(`${__dirname}/dev-data/data/users.json`, JSON.stringify(users), () => {
// 		res.status(201).json({
// 			status: 'success',
// 			requestedAt: requestTime,
// 			data: {user: newUser},
// 		});
// 	});
// };
//
// exports.updateUser = ({user, requestTime}, res) => {
// 	res.status(200).json({
// 		status: 'success',
// 		requestedAt: requestTime,
// 		data: {
// 			user: `User de ID ${user.id} atualizado`,
// 		},
// 	});
// };
//
// exports.deleteUser = ({requestTime}, res) => {
// 	res.status(204).json({
// 		status: 'success',
// 		requestedAt: requestTime,
// 		data: null,
// 	});
// };
