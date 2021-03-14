const express = require('express');
const viewsCon = require('../controllers/ViewsController');
const {isLoggedIn} = require('../controllers/AuthController');

const router = express.Router();

router.use(isLoggedIn);

router
	.get('/', viewsCon.getOverview)
	.get('/login', viewsCon.loginForm)
	.get('/tour/:slug', viewsCon.getTour);

module.exports = router;
