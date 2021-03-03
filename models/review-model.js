const {Schema, model} = require('mongoose');

const reviewSchema = new Schema(
	{
		review: {
			type: String,
			required: [true, 'Please write your review'],
			trim: true,
			maxlength: [100, 'A review name must have between 20 and 100 characters'],
			minlength: [20, 'A review name must have between 20 and 100 characters'],
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

const Review = model('Review', reviewSchema);
module.exports = Review;
