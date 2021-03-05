const Review = require('../models/ReviewModel');
const handlers = require('./HandlerFactory');

exports.getAllReviews = handlers.getAll(Review);
exports.getReview = handlers.getOne(Review);
exports.addReview = handlers.createOne(Review);
exports.updateReview = handlers.updateOne(Review);
exports.deleteReview = handlers.deleteOne(Review);

exports.setIds = (req, res, next) => {
	if (!req.body.tour) req.body.tour = req.params.tourId;
	if (!req.body.user) req.body.user = req.user.id;
	next();
};
