const Tour = require('../models/TourModel');
const globalCatch = require('../utils/GlobalCatch');
const AppError = require('../utils/AppError');

exports.getOverview = globalCatch(async (req, res) => {
	const tours = await Tour.find();

	res.status(200).render('overview', {
		title: 'All tours',
		tours,
	});
});

exports.getTour = globalCatch(async (req, res, next) => {
	const tour = await Tour.findOne({slug: req.params.slug}).populate({
		path: 'reviews',
		fields: 'review rating user',
	});

	if(!tour)
		next(new AppError('Please input a correct tour name in the url', 400))

	res.status(200).render('tour', {
		title: tour.name,
		tour,
	});
});
