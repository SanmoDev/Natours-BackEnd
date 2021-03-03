const AppError = require('../utils/AppError');
const globalCatch = require('../utils/GlobalCatch');
const APIFeatures = require('../utils/APIFeatures');

exports.getAll = Model =>
	globalCatch(async (req, res, next) => {
		//little hack to allow for the GetTourReviews endpoint
		const filter = req.params.tourId ? {tour: req.params.tourId} : {};

		const features = new APIFeatures(Model.find(filter), req.query)
			.filter()
			.search()
			.sort()
			.limitFields()
			.paginate();
		const doc = await features.query;

		res.status(200).json({
			status: 'success',
			requestedAt: req.requestTime,
			results: doc.length,
			data: {
				data: doc,
			},
		});
	});

exports.getOne = (Model, populate) =>
	globalCatch(async (req, res, next) => {
		let query = Model.findById(req.params.id);

		if (populate) query = query.populate(populate);

		const doc = await query;

		if (!doc) {
			return next(
				new AppError(`No document found with ID ${req.params.id}`, 404)
			);
		}

		res.status(200).json({
			status: 'success',
			requestedAt: req.requestTime,
			data: {
				document: doc,
			},
		});
	});

exports.createOne = Model =>
	globalCatch(async (req, res, next) => {
		const newDoc = await Model.create(req.body);

		res.status(201).json({
			status: 'success',
			data: {document: newDoc},
		});
	});

exports.updateOne = Model =>
	globalCatch(async (req, res, next) => {
		const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});

		if (!doc) {
			return next(
				new AppError(`No document found with ID ${req.params.id}`, 404)
			);
		}

		res.status(200).json({
			status: 'success',
			requestedAt: req.requestTime,
			data: {
				data: doc,
			},
		});
	});

exports.deleteOne = Model =>
	globalCatch(async (req, res, next) => {
		const doc = await Model.findByIdAndDelete(req.params.id);

		if (!doc) {
			return next(
				new AppError(`No document found with ID ${req.params.id}`, 404)
			);
		}

		res.status(204).json({
			status: 'success',
			requestedAt: req.requestTime,
			data: null,
		});
	});
