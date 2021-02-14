const express = require('express');
const userCon = require('../controllers/user-controller');
const authCon = require('../controllers/auth-controller');

const router = express.Router();

router
	.get('/', authCon.protect, userCon.getAllUsers)
	//.post('/', userCon.createUser)
	.post('/signup', authCon.signup)
	.post('/login', authCon.login)
	.post('/forgotPassword', authCon.forgotPassword)
	.patch('/resetPassword/:token', authCon.resetPassword)
	.patch('/updatePassword', authCon.protect, authCon.updatePassword)
	.patch('/updateMyAccount', authCon.protect, userCon.updateSelf)
	.delete('/deleteMyAccount', authCon.protect, userCon.deleteSelf)
	.post('/confirmEmail/:token', authCon.confirmEmail);
//.get('/:id', userCon.getUser)
//.patch('/:id', userCon.updateUser);
//.delete('/:id', userCon.deleteUser);

module.exports = router;
