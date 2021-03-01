const nodemailer = require('nodemailer');

const sendEmail = async options => {
	//CREATE TRANSPORTER
	const transporter = nodemailer.createTransport({
		host: process.env.EMAIL_HOST,
		port: process.env.EMAIL_PORT,
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PW,
		},
	});
	//DEFINE EMAIL OPTS
	const mailOptions = {
		from: 'Natours Team <icaromotta@unifei.edu.br>',
		to: options.email,
		subject: options.subject,
		text: options.message,
		//html: options.html,
	};
	//SEND EMAIL
	await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
