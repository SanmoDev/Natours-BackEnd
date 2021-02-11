const express = require('express');
const userCon = require('../controllers/user-controller');
const authCon = require('../controllers/auth-controller');

const router = express.Router();

router
	.get('/', userCon.getAllUsers)
	//.post('/', userCon.createUser)
	.post('/signup', authCon.signup)
	.post('/login', authCon.login)
	//.get('/:id', userCon.getUser)
	//.patch('/:id', userCon.updateUser)
	//.delete('/:id', userCon.deleteUser);

module.exports = router;
