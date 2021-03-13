const express = require('express');
const tourCon = require('../controllers/TourController');
const {protect, restrictTo} = require('../controllers/AuthController');
const reviewRouter = require('./review-routes');

const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);

router
	.get('/', tourCon.getAllTours)
	.post('/', protect, restrictTo('admin', 'lead-guide'), tourCon.addTour)
	.get('/top-tours', tourCon.topTours, tourCon.getAllTours)
	.get('/tour-stats', tourCon.getTourStats)
	.get('/distances/:latlng/unit/:unit', tourCon.getDistances)
	.get(
		'/tours-within/:distance/center/:latlng/unit/:unit',
		tourCon.getToursWithin
	)
	.get('/monthly-plan/:year', tourCon.getMonthlyPlan)
	.get('/:id', tourCon.getTour)
	.patch('/:id', protect, restrictTo('admin', 'lead-guide'), tourCon.updateTour)
	.delete(
		'/:id',
		protect,
		restrictTo('admin', 'lead-guide'),
		tourCon.deleteTour
	);

module.exports = router;
