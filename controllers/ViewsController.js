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

	if (!tour)
		return next(
			new AppError('Please input a correct tour name in the url', 404)
		);

	res
		.status(200)
		.set(
			'Content-Security-Policy',
			"default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
		)
		.render('tour', {
			title: tour.name,
			tour,
		});
});

exports.login = (req, res) => {
	res.status(200).render('login', {
		title: 'Login page',
	});
};

exports.signup = (req, res) => {
	res.status(200).render('signup', {
		title: 'Signup page',
	});
};

exports.myAccount = (req, res) => {
	res.status(200).render('myAccount', {
		title: 'My account',
	});
};

exports.confirmAccount = (req, res) => {
	res.status(200).render('confirmAccount', {
		title: 'Account confirmation',
		token: req.params.token,
	});
};

exports.forgotPass = (req, res) => {
	res.status(200).render('forgotPassword', {
		title: 'Password recovery',
	});
};

exports.resetPass = (req, res) => {
	res.status(200).render('resetPassword', {
		title: 'Password reset',
		token: req.params.token,
	});
};
