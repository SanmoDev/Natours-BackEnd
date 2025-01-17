/*eslint-disable*/
import axios from 'axios';
import {showAlert} from './alerts';

export const login = async (email, password) => {
	try {
		const res = await axios({
			method: 'POST',
			url: '/api/users/login',
			data: {
				email,
				password,
			},
		});

		if (res.data.status === 'success') {
			showAlert('success', 'Logged in successfully');
			window.setTimeout(() => location.assign('/'), 1000);
		}
	} catch (err) {
		showAlert('error', err.response.data.message);
	}
};

export const logout = async () => {
	try {
		const res = await axios({
			method: 'GET',
			url: '/api/users/login',
		});

		if (res.data.status === 'success') {
			if (location.pathname === '/account') location.assign('/');
			else location.reload(true);
		}
	} catch (err) {
		showAlert('error', 'Error logging out, please try again.');
	}
};
