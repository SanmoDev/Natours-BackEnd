const User = require('../models/user-model');
const globalCatch = require('../Utils/GlobalCatch');

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
