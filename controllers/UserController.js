const multer = require('multer');
const sharp = require('sharp');
const AppError = require('../utils/AppError');
const globalCatch = require('../utils/GlobalCatch');
const handlers = require('./HandlerFactory');
const User = require('../models/UserModel');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
	if (file.mimetype.startsWith('image')) {
		cb(null, true);
	} else {
		cb(new AppError('Wrong file type, please upload an image!', 400), false);
	}
};

const upload = multer({storage, fileFilter});
exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = globalCatch(async (req, res, next) => {
	if (!req.file) return next();

	req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

	await sharp(req.file.buffer)
		.resize(500, 500, {position: 'top'})
		.toFormat('jpeg')
		.jpeg({quality: 90})
		.toFile(`public/img/users/${req.file.filename}`);

	next();
});

exports.getAllUsers = handlers.getAll(User);
exports.getUser = handlers.getOne(User);
exports.updateUser = handlers.updateOne(User);
exports.deleteUser = handlers.deleteOne(User);

exports.getMe = (req, res, next) => {
	req.params.id = req.user.id;
	next();
};

const filterObj = (obj, ...allowed) => {
	const newObj = {};
	Object.keys(obj).forEach(el => {
		if (allowed.includes(el)) newObj[el] = obj[el];
	});

	return newObj;
};

exports.addUser = (req, res) => {
	res.status(500).json({
		status: 'error',
		message: 'This route is not defined, please use /signup instead',
	});
};

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
	if (req.file) filteredBody.photo = req.file.filename;
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
