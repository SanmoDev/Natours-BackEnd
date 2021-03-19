/*eslint-disable*/
import axios from 'axios';
import {showAlert} from './alerts';

export const sendRecoveryToken = async email => {
	try {
		const res = await axios({
			method: 'POST',
			url: '/api/users/forgotPassword',
			data: {email},
		});

		if (res.data.status === 'success') {
			showAlert(
				'success',
				`Your password reset token has been sent to your email successfully`
			);
			window.setTimeout(() => location.assign('/'), 1000);
		}
	} catch (err) {
		showAlert('error', err.response.data.message);
	}
};

export const resetPassword = async (password, passwordConfirm, token) => {
	try {
		const res = await axios({
			method: 'PATCH',
			url: `/api/users/resetPassword/${token}`,
			data: {
				password,
				passwordConfirm,
			},
		});

		if (res.data.status === 'success') {
			showAlert('success', `Your password has been updated successfully`);
			window.setTimeout(() => location.assign('/'), 1000);
		}
	} catch (err) {
		showAlert('error', err.response.data.message);
	}
};
