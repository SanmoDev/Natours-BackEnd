/*eslint-disable*/
import '@babel/polyfill';
import {displayMap} from './mapbox';
import {login, logout} from './login';

//DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('#login-form');
const userForm = document.querySelector('#user-form');
const logoutBtn = document.querySelector('.nav__el--logout');

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

if (userForm) {
	userForm.addEventListener('submit', e => {
		e.preventDefault();
		const name = document.getElementById('email').value;
		const email = document.getElementById('email').value;
		const photo = document.getElementById('email').value;
	});
}

if (logoutBtn) logoutBtn.addEventListener('click', logout);
