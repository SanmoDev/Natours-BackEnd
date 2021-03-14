const express = require('express');
const userCon = require('../controllers/UserController');
const authCon = require('../controllers/AuthController');

const router = express.Router();

//PUBLIC ROUTES
router
	.get('/login', authCon.logout)
	.post('/login', authCon.login)
	.post('/signup', authCon.signup)
	.post('/forgotPassword', authCon.forgotPassword)
	.post('/confirmEmail/:token', authCon.confirmEmail)
	.patch('/resetPassword/:token', authCon.resetPassword);

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
