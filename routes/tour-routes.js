const express = require('express');
const tourCon = require('../controllers/tour-controller');
const {protect, restrictTo} = require('../controllers/auth-controller');
const reviewRouter = require('./review-routes');

const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);

router
	.get('/', tourCon.getAllTours)
	.post('/', protect, restrictTo('admin', 'lead-guide'), tourCon.addTour)
	.get('/top-tours', tourCon.topTours, tourCon.getAllTours)
	.get('/tour-stats', tourCon.getTourStats)
	.get('/monthly-plan/:year', tourCon.getMonthlyPlan)
	.get('/:id', tourCon.getTour)
	.patch('/:id', protect, restrictTo('admin', 'lead-guide'), tourCon.updateTour)
	.delete(
		'/:id',
		protect,
		restrictTo('admin', 'lead-guide'),
		tourCon.deleteTour
	);

//rotas com :id tem que estar em baixo

module.exports = router;
