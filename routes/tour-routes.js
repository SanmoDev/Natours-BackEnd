const express = require('express');
const tourCon = require('../controllers/tour-controller');

const authCon = require('../controllers/auth-controller');

const router = express.Router();

router
	.get('/', tourCon.getAllTours)
	.post('/', authCon.protect, authCon.restrictTo('admin'), tourCon.addTour)
	.get('/top-tours', tourCon.topTours, tourCon.getAllTours)
	.get(
		'/tour-stats',
		authCon.protect,
		authCon.restrictTo('admin'),
		tourCon.getTourStats
	)
	.get('/monthly-plan/:year', tourCon.getMonthlyPlan)
	.get('/:id', tourCon.getTour)
	.patch(
		'/:id',
		authCon.protect,
		authCon.restrictTo('admin'),
		tourCon.updateTour
	)
	.delete(
		'/:id',
		authCon.protect,
		authCon.restrictTo('admin'),
		tourCon.deleteTour
	);
//rotas com :id tem que estar em baixo

module.exports = router;
