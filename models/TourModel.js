const {Schema, model} = require('mongoose');

const tourSchema = new Schema(
	{
		name: {
			type: String,
			required: [true, 'A tour must have a name'],
			unique: true,
			trim: true,
			maxlength: [40, 'A tour name must have between 5 and 40 characters'],
			minlength: [5, 'A tour name must have between 5 and 40 characters'],
		},
		duration: {
			type: Number,
			required: [true, 'A tour must have a duration'],
		},
		price: {
			type: Number,
			required: [true, 'A tour must have a defined price'],
		},
		maxGroupSize: {
			type: Number,
			required: [true, 'A tour must have a max group size'],
		},
		difficulty: {
			type: String,
			required: [true, 'A tour must have a difficulty level'],
			enum: {
				values: ['easy', 'medium', 'difficult'],
				message:
					"The difficulty must be either 'easy', 'medium' or 'difficult'",
			},
		},
		ratingsAverage: {
			type: Number,
			default: 1,
			min: [1, 'The average rating must be between 1 and 5 stars'],
			max: [5, 'The average rating must be between 1 and 5 stars'],
		},
		ratingsQuantity: {
			type: Number,
			default: 0,
		},
		discount: {
			type: Number,
			validate: {
				validator: function (val) {
					return val < this.price;
				},
				message:
					'The discounted price must be lower than the regular price, it cannot be {VALUE}',
			},
		},
		summary: {
			type: String,
			trim: true,
			required: [true, 'A tour must have a synopsis'],
		},
		description: {
			type: String,
			trim: true,
			required: [true, 'A tour must have a description'],
		},
		imageCover: {
			type: String,
			required: [true, 'A tour must have a cover image'],
		},
		images: [String],
		createdAt: {
			type: Date,
			default: Date.now(),
		},
		startDates: [Date],
		startLocation: {
			type: {
				type: String,
				default: 'Point',
				enum: ['Point'],
			},
			coordinates: [Number],
			address: String,
			description: String,
		},
		locations: [
			{
				type: {
					type: String,
					default: 'Point',
					enum: ['Point'],
				},
				coordinates: [Number],
				address: String,
				description: String,
				day: Number,
			},
		],
		guides: [
			{
				type: Schema.ObjectId,
				ref: 'User',
			},
		],
	},
	{
		toJSON: {virtuals: true},
		toObject: {virtuals: true},
	}
);

tourSchema.index({price: 1, ratingsAverage: -1});
tourSchema.index({slug: 1});

tourSchema.virtual('durationWeeks').get(function () {
	return this.duration / 7;
});

tourSchema.virtual('reviews', {
	ref: 'Review',
	foreignField: 'tour',
	localField: '_id',
});

tourSchema.pre(/^find/, function (next) {
	this.populate({
		path: 'guides',
		select: '-__v -passwordChangedAt',
	});

	next();
});

// tourSchema.pre('save', async function (next) {
// 	const guidesPromises = this.guides.map(async id => await User.findById(id));
// 	this.guides = await Promise.all(guidesPromises);
//
// 	next();
// });

const Tour = model('Tour', tourSchema);
module.exports = Tour;
