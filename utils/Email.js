const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
	constructor(user, url) {
		this.to = user.email;
		this.firstName = user.name.split(' ')[0];
		this.url = url;
	}

	newTransport() {
		if (process.env.NODE_ENV.includes('production')) {
			return nodemailer.createTransport({
				service: 'SendGrid',
				auth: {
					user: 'apikey',
					pass: process.env.SENDGRID_API_KEY,
				},
			});
		}

		//CREATE TRANSPORTER
		return nodemailer.createTransport({
			host: process.env.EMAIL_HOST,
			port: process.env.EMAIL_PORT,
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PW,
			},
		});
	}

	async send(template, subject) {
		//Render HTML from pug template
		const html = pug.renderFile(
			`${__dirname}/../views/emails/${template}.pug`,
			{
				firstName: this.firstName,
				url: this.url,
				subject,
			}
		);
		//Define email options
		const mailOptions = {
			from: process.env.EMAIL_FROM,
			to: this.to,
			subject,
			html,
			text: htmlToText.fromString(html),
		};
		//Create transport and send email
		await this.newTransport().sendMail(mailOptions);
	}

	async sendWelcome() {
		await this.send(
			'welcome',
			'Natours email confirmation token (valid for 10min)'
		);
	}

	async sendPassReset() {
		await this.send(
			'passwordReset',
			'Natours password reset token (valid for 10min)'
		);
	}
};
