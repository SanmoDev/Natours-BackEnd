const Tour = require('../models/TourModel');
const globalCatch = require('../utils/GlobalCatch');
const handlers = require('./HandlerFactory');
const AppError = require('../utils/AppError');

exports.getAllTours = handlers.getAll(Tour);
exports.getTour = handlers.getOne(Tour, {path: 'reviews'});
exports.addTour = handlers.createOne(Tour);
exports.updateTour = handlers.updateOne(Tour);
exports.deleteTour = handlers.deleteOne(Tour);

exports.topTours = globalCatch(async (req, res, next) => {
	req.query.limit = '5';
	req.query.sort = '-ratingsAverage,price';
	req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
	next();
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

///tours-within/250/center/34.054077,-118.364368/unit/km
exports.getToursWithin = async (req, res, next) => {
	const {distance, latlng, unit} = req.params;
	const [lat, lng] = latlng.split(',');

	const radius =
		unit === 'mi'
			? distance / 3963.2
			: unit === 'km'
			? distance / 6378.1
			: undefined;

	if (!lat || !lng)
		next(
			new AppError(
				'Please provide a latitude and longitude in the correct format (lat,lng)',
				400
			)
		);
	if (!radius)
		next(new AppError('Please provide a correct unit (mi or km)', 400));

	const tours = await Tour.find({
		startLocation: {$geoWithin: {$centerSphere: [[lng, lat], radius]}},
	});

	res.status(200).json({
		status: 'success',
		results: tours.length,
		data: {data: tours},
	});
};

exports.getDistances = globalCatch(async (req, res, next) => {
	const {latlng, unit} = req.params;
	const [lat, lng] = latlng.split(',');

	const multiplier =
		unit === 'mi' ? 0.000621371 : unit === 'km' ? 0.001 : undefined;

	if (!lat || !lng)
		next(
			new AppError(
				'Please provide a latitude and longitude in the correct format (lat,lng)',
				400
			)
		);
	if (!multiplier)
		next(new AppError('Please provide a correct unit (mi or km)', 400));

	const distances = await Tour.aggregate([
		{
			$geoNear: {
				near: {type: 'Point', coordinates: [Number(lng), Number(lat)]},
				distanceField: 'distance',
				distanceMultiplier: multiplier,
			},
		},
		{
			$project: {
				distance: 1,
				name: 1,
			},
		},
	]);

	res.status(200).json({
		status: 'success',
		data: {data: distances},
	});
});
