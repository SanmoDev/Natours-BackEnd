const express = require('express');
const userCon = require('../controllers/user-controller');
const authCon = require('../controllers/auth-controller');

const router = express.Router();

router
	.get('/', authCon.protect, authCon.restrictTo('admin'), userCon.getAllUsers)
	.post('/', authCon.protect, authCon.restrictTo('admin'), userCon.createUser)
	.post('/signup', authCon.signup)
	.post('/login', authCon.login)
	.post('/forgotPassword', authCon.forgotPassword)
	.patch('/resetPassword/:token', authCon.resetPassword)
	.patch('/updatePassword', authCon.protect, authCon.updatePassword)
	.patch('/updateMyAccount', authCon.protect, userCon.updateSelf)
	.delete('/deleteMyAccount', authCon.protect, userCon.deleteSelf)
	.post('/confirmEmail/:token', authCon.confirmEmail)
	.get('/:id', authCon.protect, authCon.restrictTo('admin'), userCon.getUser);
// .patch(
// 	'/:id',
// 	authCon.protect,
// 	authCon.restrictTo('admin'),
// 	userCon.updateUser
// );
//.delete('/:id', authCon.protect, authCon.restrictTo('admin'), userCon.deleteUser);

module.exports = router;
