const express = require('express');
const viewsCon = require('../controllers/ViewsController');

const router = express.Router();

router
	.get('/', viewsCon.getOverview)
	.get('/tour/:slug', viewsCon.getTour);

module.exports = router;
