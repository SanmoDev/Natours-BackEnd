const Tour = require('../models/tour-model');
const APIFeatures = require('../Utils/APIFeatures');
const globalCatch = require('../Utils/GlobalCatch');
const AppError = require('../Utils/AppError');

exports.topTours = globalCatch(async (req, res, next) => {
	req.query.limit = '5';
	req.query.sort = '-ratingsAverage,price';
	req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
	next();
});

exports.getAllTours = globalCatch(async (req, res, next) => {
	const features = new APIFeatures(Tour.find(), req.query)
		.filter()
		.sort()
		.limitFields()
		.paginate();
	const tours = await features.query;

	res.status(200).json({
		status: 'success',
		requestedAt: req.requestTime,
		results: tours.length,
		data: {
			tours,
		},
	});
});

exports.getTour = globalCatch(async (req, res, next) => {
	const tour = await Tour.findById(req.params.id);

	if (!tour) {
		return next(new AppError(`No tour found with ID ${req.params.id}`, 404));
	}

	res.status(200).json({
		status: 'success',
		requestedAt: req.requestTime,
		data: {
			tour,
		},
	});
});

exports.addTour = globalCatch(async (req, res, next) => {
	const newTour = await Tour.create(req.body);

	res.status(201).json({
		status: 'success',
		data: {tour: newTour},
	});
});

exports.updateTour = globalCatch(async (req, res, next) => {
	const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});

	if (!tour) {
		return next(new AppError(`No tour found with ID ${req.params.id}`, 404));
	}

	res.status(200).json({
		status: 'success',
		requestedAt: req.requestTime,
		data: {
			tour,
		},
	});
});

exports.deleteTour = globalCatch(async (req, res, next) => {
	const tour = await Tour.findByIdAndDelete(req.params.id);

	if (!tour) {
		return next(new AppError(`No tour found with ID ${req.params.id}`, 404));
	}

	res.status(204).json({
		status: 'success',
		requestedAt: req.requestTime,
		data: null,
	});
});

exports.getTourStats = globalCatch(async (req, res, next) => {
	const stats = await Tour.aggregate([
		{
			$match: {ratingsAverage: {$gte: 4.5}},
		},
		{
			$group: {
				_id: {$toUpper: `$${req.query.fields}`},
				results: {$sum: 1},
				numRatings: {$sum: '$ratingsQuantity'},
				avgRating: {$avg: '$ratingsAverage'},
				avgPrice: {$avg: '$price'},
				minPrice: {$min: '$price'},
				maxPrice: {$max: '$price'},
			},
		},
		{
			$sort: {avgPrice: 1},
		},
	]);

	res.status(200).json({
		status: 'success',
		requestedAt: req.requestTime,
		data: {
			stats,
		},
	});
});

exports.getMonthlyPlan = globalCatch(async (req, res, next) => {
	const year = parseInt(req.params.year);
	const plan = await Tour.aggregate([
		{
			$unwind: '$startDates',
		},
		{
			$match: {
				startDates: {
					$gte: new Date(`${year}-01-01`),
					$lte: new Date(`${year}-12-31`),
				},
			},
		},
		{
			$group: {
				_id: {$month: '$startDates'},
				numTours: {$sum: 1},
				tours: {$push: '$name'},
			},
		},
		{
			$addFields: {month: '$_id'},
		},
		{
			$project: {_id: 0},
		},
		{
			$sort: {numTours: -1},
		},
	]);

	res.status(200).json({
		status: 'success',
		requestedAt: req.requestTime,
		data: {
			plan,
		},
	});
});
