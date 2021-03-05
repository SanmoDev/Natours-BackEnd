const {Schema, model} = require('mongoose');
const Tour = require('./TourModel');

const reviewSchema = new Schema(
	{
		review: {
			type: String,
			required: [true, 'Please write your review'],
			trim: true,
			maxlength: [300, 'A review must have less then 300 characters'],
		},
		rating: {
			type: Number,
			required: [true, 'Please give your rating'],
			min: [1, 'The rating must be between 1 and 5 stars'],
			max: [5, 'The rating must be between 1 and 5 stars'],
		},
		createdAt: {
			type: Date,
			default: Date.now(),
		},
		tour: {
			type: Schema.ObjectId,
			ref: 'Tour',
			required: [true, 'A review must reference a tour'],
		},
		user: {
			type: Schema.ObjectId,
			ref: 'User',
			required: [true, 'A review must belong to a user'],
		},
	},
	{
		toJSON: {virtuals: true},
		toObject: {virtuals: true},
	}
);

reviewSchema.pre(/^find/, function (next) {
	this.populate({
		path: 'user',
		select: 'name photo',
	});

	next();
});

reviewSchema.statics.calcAvgRating = async function (tourId) {
	const stats = await this.aggregate([
		{$match: {tour: tourId}},
		{
			$group: {
				_id: '$tour',
				nRating: {$sum: 1},
				avgRating: {$avg: '$rating'},
			},
		},
	]);

	if (stats.length > 0) {
		await Tour.findByIdAndUpdate(tourId, {
			ratingsQuantity: stats[0].nRating,
			ratingsAverage: stats[0].avgRating,
		});
	} else {
		await Tour.findByIdAndUpdate(tourId, {
			ratingsQuantity: 0,
			ratingsAverage: 4.5,
		});
	}
};

//CALCULATING TOUR RATINGS AFTER SAVE
reviewSchema.post('save', function () {
	this.constructor.calcAvgRating(this.tour);
});

//CALCULATING TOUR RATINGS BEFORE UPDATE AND DELETE
reviewSchema.pre(/^findOneAnd/, async function (next) {
	this.r = await this.findOne();
	next();
});
reviewSchema.post(/^findOneAnd/, async function () {
	//await this.findOne() DOES NOT WORK HERE, THE QUERY HAS ALREADY EXECUTED
	await this.r.constructor.calcAvgRating(this.r.tour);
});

const Review = model('Review', reviewSchema);
module.exports = Review;
