const express = require('express');
const userCon = require('../controllers/user-controller');
const authCon = require('../controllers/auth-controller');

const router = express.Router();

//PUBLIC ROUTES
router
	.post('/signup', authCon.signup)
	.post('/login', authCon.login)
	.post('/forgotPassword', authCon.forgotPassword)
	.patch('/resetPassword/:token', authCon.resetPassword)
	.post('/confirmEmail/:token', authCon.confirmEmail);

//USER ROUTES (must be logged in)
router.use(authCon.protect);
router
	.get('/me', userCon.getMe, userCon.getUser)
	.patch('/updatePassword', authCon.updatePassword)
	.patch('/updateMyAccount', userCon.updateSelf)
	.delete('/deleteMyAccount', userCon.deleteSelf);

//ADMIN ONLY ROUTES
router.use(authCon.restrictTo('admin'));
router
	.get('/', userCon.getAllUsers)
	.post('/', userCon.addUser)
	.get('/:id', userCon.getUser)
	.delete('/:id', userCon.deleteUser)
	.patch('/:id', userCon.updateUser)
	.delete('/:id', userCon.deleteUser);

module.exports = router;
