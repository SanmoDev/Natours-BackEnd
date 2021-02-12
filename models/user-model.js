const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

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
});

//ENCRYPTING PASSWORD
userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next();

	this.password = await bcrypt.hash(this.password, 12);
	this.passwordConfirm = undefined;
	next();
});

userSchema.methods.correctPassword = (candidPW, userPW) =>
	bcrypt.compare(candidPW, userPW);

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

const User = mongoose.model('User', userSchema);
module.exports = User;
