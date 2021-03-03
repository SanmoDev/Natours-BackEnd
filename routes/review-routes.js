const express = require('express');
const reviewCon = require('../controllers/review-controller');
const {protect, restrictTo} = require('../controllers/auth-controller');

const router = express.Router({mergeParams: true});

router
	.get('/', reviewCon.getAllReviews)
	//.post('/', protect, reviewCon.addReview)
	.post('/', protect, restrictTo('user'), reviewCon.setIds, reviewCon.addReview)
	.get('/:id', reviewCon.getReview)
	.delete('/:id', protect, reviewCon.deleteReview)
	.patch('/:id', protect, reviewCon.updateReview);

module.exports = router;
