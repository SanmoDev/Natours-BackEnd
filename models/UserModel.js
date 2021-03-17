const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'A user must have a name'],
	},
	email: {
		type: String,
		required: [true, 'A user must have an email'],
		unique: true,
		lowercase: true,
		validate: [validator.isEmail, 'Please provide a valid email'],
	},
	photo: {
		type: String,
		default: 'default.jpg',
	},
	role: {
		type: String,
		enum: ['user', 'guide', 'lead-guide', 'admin'],
		default: 'user',
	},
	password: {
		type: String,
		required: [true, 'A user must have a password'],
		minlength: [8, 'Password must have at least 8 characters'],
		select: false,
	},
	passwordConfirm: {
		type: String,
		required: [true, 'Please confirm your password'],
		validate: {
			//THIS VALIDATOR ONLY WORKS ON SAVE
			validator: function (el) {
				return el === this.password;
			},
			message: 'Please input the same password in the confirmation field',
		},
	},
	passwordChangedAt: {
		type: Date,
		select: false,
	},
	passwordResetToken: {
		type: String,
		select: false,
	},
	passwordResetExpires: {
		type: Date,
		select: false,
	},
	emailConfirmToken: {
		type: String,
		select: false,
	},
	active: {
		type: Boolean,
		default: false,
		select: false,
	},
});

//UPDATING passwordChangedAt
userSchema.pre('save', function (next) {
	if (!this.isModified('password') || this.isNew) return next();

	this.passwordChangedAt = Date.now() - 1000;
	next();
});

//ENCRYPTING PASSWORD
userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next();

	this.password = await bcrypt.hash(this.password, 12);
	this.passwordConfirm = undefined;
	next();
});

//GET ONLY ACTIVE ACCOUNTS IN THE GET ALL FUNCTION
userSchema.pre('find', function (next) {
	this.find({active: {$ne: false}});
	next();
});

//CHECK PASSWORD
userSchema.methods.correctPassword = (candidPW, userPW) =>
	bcrypt.compare(candidPW, userPW);

//CHECK IF PASSWORD HAS CHANGED AFTER TOKEN WAS ISSUED
userSchema.methods.passwordChanged = function (TokenIssueTime) {
	if (this.passwordChangedAt) {
		const changedTimeStamp = parseInt(
			this.passwordChangedAt.getTime() / 1000,
			10
		);
		return TokenIssueTime < changedTimeStamp;
	}
	return false;
};

//CREATE TOKEN FOR RESETTING THE PASSWORD
userSchema.methods.createPwResetToken = function () {
	const resetToken = crypto.randomBytes(32).toString('hex');
	this.passwordResetToken = crypto
		.createHash('sha256')
		.update(resetToken)
		.digest('hex');

	this.passwordResetExpires =
		Date.now() + parseInt(process.env.RESET_TOKEN_EXPIRE, 10);
	//console.log({resetToken}, this.passwordResetToken);

	return resetToken;
};

//CREATE TOKEN TO CONFIRM EMAIL
userSchema.methods.createEmailConfirmToken = function () {
	const confirmToken = crypto.randomBytes(32).toString('hex');
	this.emailConfirmToken = crypto
		.createHash('sha256')
		.update(confirmToken)
		.digest('hex');
	//console.log({confirmToken}, this.emailConfirmToken);

	return confirmToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
