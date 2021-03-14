/*eslint-disable*/

const login = async (email, password) => {
	console.log({email}, {password});
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
			alert('Logged in successfully');
			location.assign('/');
		}

		console.log(res);
	} catch (err) {
		alert(err.response.data.message);
	}
};

document.querySelector('.form').addEventListener('submit', e => {
	e.preventDefault();

	const email = document.getElementById('email').value;
	const pass = document.getElementById('password').value;
	login(email, pass);
});
