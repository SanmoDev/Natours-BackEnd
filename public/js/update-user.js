/*eslint-disable*/
import axios from 'axios';
import {showAlert} from './alerts';

export const updateUser = async (data, type) => {
	try {
		const res = await axios({
			method: 'PATCH',
			url:
				type === 'data'
					? '/api/users/UpdateMyAccount'
					: '/api/users/updatePassword',
			data: data,
		});

		if (res.data.status === 'success') {
			showAlert('success', `Your ${type} has been updated successfully`);
		}
	} catch (err) {
		showAlert('error', err.response.data.message);
	}
};
