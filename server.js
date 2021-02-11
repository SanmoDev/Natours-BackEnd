const {connect} = require('mongoose');
const env = require('dotenv');

//Treating uncaught exceptions which occur in synchronous code
process.on('uncaughtException', err => {
	console.error(`${err.name}\nError: ${err.message}`);
	process.exit(1);
});

env.config({path: './config.env'});
const app = require('./app');

connect(process.env.DATABASE, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true,
	useFindAndModify: false,
}).then(() => console.log('Connected to database'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
	console.log(`App running on port ${port}`);
});

//Treating unhandled rejections which occur inside async functions
process.on('unhandledRejection', err => {
	console.error(`${err.name}\nError: ${err.message}`);
	server.close(() => process.exit(1));
});
