const express = require('express');
const reviewCon = require('../controllers/ReviewController');
const {protect, restrictTo} = require('../controllers/AuthController');

const router = express.Router({mergeParams: true});
router.use(protect);

router
	.get('/', reviewCon.getAllReviews)
	.post('/', restrictTo('user'), reviewCon.setIds, reviewCon.addReview)
	.get('/:id', reviewCon.getReview)
	.delete('/:id', restrictTo('user', 'admin'), reviewCon.deleteReview)
	.patch('/:id', restrictTo('user'), reviewCon.updateReview);

module.exports = router;
