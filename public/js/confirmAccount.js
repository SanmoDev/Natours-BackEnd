/*eslint-disable*/
import axios from 'axios';
import {showAlert} from './alerts';

exports.confirmAccount = async token => {
	try {
		const res = await axios({
			method: 'POST',
			url: `/api/users/confirmEmail/${token}`,
		});

		if (res.data.status === 'success') {
			showAlert('success', 'Your account was confirmed successfully');
			window.setTimeout(() => location.assign('/'), 1000);
		}
	} catch (err) {
		showAlert('error', err.response.data.message);
	}
};
