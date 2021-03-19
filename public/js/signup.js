/*eslint-disable*/
import axios from 'axios';
import {showAlert} from './alerts';

export const signup = async (name, email, password, passwordConfirm) => {
	try {
		const res = await axios({
			method: 'POST',
			url: '/api/users/signup',
			data: {
				name,
				email,
				password,
				passwordConfirm,
			},
		});

		if (res.data.status === 'success') {
			showAlert(
				'success',
				'Account created successfully, please check your email for the account confirmation token'
			);
			window.setTimeout(() => location.assign('/'), 1000);
		}
	} catch (err) {
		showAlert('error', err.response.data.message);
	}
};
