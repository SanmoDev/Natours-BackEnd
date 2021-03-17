const express = require('express');
const viewsCon = require('../controllers/ViewsController');
const {isLoggedIn, protect} = require('../controllers/AuthController');

const router = express.Router();

router.get('/account', protect, viewsCon.myAccount);

router.use(isLoggedIn);

router
	.get('/', viewsCon.getOverview)
	.get('/login', viewsCon.loginForm)
	.get('/account', protect, viewsCon.myAccount)
	.get('/tour/:slug', viewsCon.getTour);

module.exports = router;
