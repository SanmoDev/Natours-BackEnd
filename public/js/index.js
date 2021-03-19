/*eslint-disable*/
import '@babel/polyfill';
import {displayMap} from './mapbox';
import {login, logout} from './login';
import {signup} from './signup';
import {updateUser} from './update-user';
import {confirmAccount} from './confirmAccount';
import {sendRecoveryToken, resetPassword} from './resetPassword';

//DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('#login-form');
const signupForm = document.querySelector('#form-signup');
const recoveryForm = document.querySelector('#password-recovery-form');
const resetPassForm = document.querySelector('#reset-password-form');
const userDataForm = document.querySelector('.form-user-data');
const passwordForm = document.querySelector('.form-user-password');
const logoutBtn = document.querySelector('.nav__el--logout');
const emailTokenField = document.querySelector('#email-confirmation-token');
const passwordTokenField = document.querySelector('#password-reset-token');

//DELEGATION
if (mapBox) {
	const locations = JSON.parse(mapBox.dataset.locations);
	displayMap(locations);
}

if (loginForm) {
	loginForm.addEventListener('submit', e => {
		e.preventDefault();
		const email = document.getElementById('email').value;
		const password = document.getElementById('password').value;

		login(email, password);
	});
}

if (signupForm) {
	signupForm.addEventListener('submit', e => {
		e.preventDefault();
		const name = document.getElementById('name').value;
		const email = document.getElementById('email').value;
		const password = document.getElementById('password').value;
		const passwordConfirm = document.getElementById('passwordConfirm').value;

		signup(name, email, password, passwordConfirm);
	});
}

if (recoveryForm) {
	recoveryForm.addEventListener('submit', e => {
		e.preventDefault();
		sendRecoveryToken(document.getElementById('email').value);
	});
}

if (resetPassForm) {
	resetPassForm.addEventListener('submit', e => {
		e.preventDefault();
		const password = document.getElementById('password').value;
		const passwordConfirm = document.getElementById('passwordConfirm').value;
		const token = passwordTokenField.getAttribute('token');

		resetPassword(password, passwordConfirm, token);
	});
}

if (userDataForm) {
	userDataForm.addEventListener('submit', async e => {
		e.preventDefault();

		const form = new FormData();
		form.append('name', document.getElementById('name').value);
		form.append('email', document.getElementById('email').value);
		form.append('photo', document.getElementById('photo').files[0]);

		const btn = document.querySelector('.btn--data');

		btn.disabled = true;
		btn.textContent = 'Updating...';
		await updateUser(form, 'data');
		btn.disabled = false;
		btn.textContent = 'Save settings';
	});
}

if (passwordForm) {
	passwordForm.addEventListener('submit', async e => {
		e.preventDefault();

		const btn = document.querySelector('.btn--password');
		const passwordCurrent = document.getElementById('password-current').value;
		const password = document.getElementById('password').value;
		const passwordConfirm = document.getElementById('password-confirm').value;

		btn.disabled = true;
		btn.textContent = 'Updating...';
		await updateUser({passwordCurrent, password, passwordConfirm}, 'password');
		btn.disabled = false;
		btn.textContent = 'Save password';

		document.getElementById('password-current').value = '';
		document.getElementById('password').value = '';
		document.getElementById('password-confirm').value = '';
	});
}

if (logoutBtn) logoutBtn.addEventListener('click', logout);

if (emailTokenField) confirmAccount(emailTokenField.getAttribute('token'));
