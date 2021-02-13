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
	photo: String,
	role: {
		type: String,
		enum: ['user', 'guide', 'lead-guide', 'admin'],
		default: 'user',
	},
	password: {
		type: String,
		required: [true, 'A user must have a password'],
		minlength: [6, 'Password must have at least 6 characters'],
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
	passwordChangedAt: Date,
	passwordResetToken: String,
	passwordResetExpires: Date,
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

//RESET PASSWORD
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

const User = mongoose.model('User', userSchema);
module.exports = User;
