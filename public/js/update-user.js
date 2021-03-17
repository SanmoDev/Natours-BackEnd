/*eslint-disable*/
import {showAlert} from './alerts';
import axios from 'axios';

export const updateUser = async (...args) => {
	try {
		const res = await axios({
			method: 'PATCH',
			url: '/api/users/login',
			data: {
				...args,
			},
		});

		if (res.data.status === 'success') {
			showAlert('success', 'Logged in successfully');
			window.setTimeout(() => location.assign('/'), 1000);
		}

		console.log(res);
	} catch (err) {
		showAlert('error', err.response.data.message);
	}
};
