const express = require('express');
const viewsCon = require('../controllers/ViewsController');
const {isLoggedIn, protect} = require('../controllers/AuthController');

const router = express.Router();

router.get('/account', protect, viewsCon.myAccount);

router.use(isLoggedIn);

router
	.get('/', viewsCon.getOverview)
	.get('/login', viewsCon.login)
	.get('/signup', viewsCon.signup)
	.get('/forgotPassword', viewsCon.forgotPass)
	.get('/account', protect, viewsCon.myAccount)
	.get('/tour/:slug', viewsCon.getTour)
	.get('/resetPassword/:token', viewsCon.resetPass)
	.get('/confirmAccount/:token', viewsCon.confirmAccount);

module.exports = router;
