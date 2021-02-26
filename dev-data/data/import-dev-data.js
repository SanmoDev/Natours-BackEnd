const fs = require('fs');
const mongoose = require('mongoose');
const env = require('dotenv');
const Tour = require('../../models/tour-model');

env.config({path: './config.env'});

const DB = process.env.DATABASE.replace('PASSWORD', process.env.PASSWORD);

mongoose
	.connect(DB, {
		useNewUrlParser: true,
		useCreateIndex: true,
		useFindAndModify: false,
	})
	.then(() => {
		console.log('Conexão feita com sucesso!');
	});

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));

const importData = async () => {
	try {
		await Tour.create(tours);
		console.log('Tours criados com sucesso');
	} catch (err) {
		console.log(err);
	} finally {
		process.exit();
	}
};

const deleteData = async () => {
	try {
		await Tour.deleteMany();
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
