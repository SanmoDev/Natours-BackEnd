const fs = require('fs');
const {connect} = require('mongoose');
const env = require('dotenv');
const Tour = require('../../models/TourModel');
const User = require('../../models/UserModel');
const Review = require('../../models/ReviewModel');

env.config({path: './config.env'});

connect(process.env.DATABASE, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true,
	useFindAndModify: false,
}).then(() => console.log('Connected to database'));

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
	fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

const importData = async () => {
	try {
		await Tour.create(tours);
		await User.create(users, {validateBeforeSave: false});
		await Review.create(reviews);
		console.log('Documentos criados com sucesso');
	} catch (err) {
		console.log(err);
	} finally {
		process.exit();
	}
};

const deleteData = async () => {
	try {
		await Tour.deleteMany();
		await User.deleteMany();
		await Review.deleteMany();
		console.log('O banco de dados foi zerado com sucesso');
	} catch (err) {
		console.log(err);
	} finally {
		process.exit();
	}
};

switch (process.argv[2]) {
	case '--import':
		importData();
		break;
	case '--delete':
		deleteData();
		break;
	default:
		break;
}
