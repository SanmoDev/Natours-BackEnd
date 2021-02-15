const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema(
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
		// secretTour: {
		// 	type: Boolean,
		// 	default: false
		// }
	},
	{
		toJSON: {virtuals: true},
		toObject: {virtuals: true},
	}
);

tourSchema.virtual('durationWeeks').get(function () {
	return this.duration / 7;
});

//DOC MIDDLEWARE, RUNS BEFORE .save() AND .create()
// tourSchema.pre('save', function(next) {
// 	this.slug = slugify(this.name, { lower: true });
// 	next();
// });
//
// tourSchema.post('save', function(doc, next) {
// 	console.log(doc);
// 	next();
// });

//QUERY MIDDLEWARE
// tourSchema.pre(/^find/, function(next) {
// 	this.find({ secretTour: { $ne: true } });
// 	this.start = Date.now();
// 	next();
// });
//
// tourSchema.post(/^find/, function(docs, next) {
// 	console.log(`Query took ${Date.now() - this.start}ms`);
// 	console.log(docs);
// 	next();
// });

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
