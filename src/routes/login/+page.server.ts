import { API_BASE_URL } from '$env/static/private';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	login: async ({ request, cookies }) => {
		const data = await request.formData();
		const email = data.get('email');
		const password = data.get('password');

		if (!email || !password) {
			return fail(400, { error: 'Missing email or password' });
		}

		const response = await fetch(`${API_BASE_URL}/api/v1/authentication/login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ login: email, password })
		});

		if (!response.ok) {
			const error = await response.json();
			return fail(response.status, { error: error.message || 'Invalid credentials' });
		}

		const { token } = await response.json();

		if (!token) {
			return fail(500, { error: 'Login successful, but no token was received.' });
		}

		cookies.set('jwt_token', token, {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			maxAge: 60 * 60 * 24 * 7 // 1 week
		});

		throw redirect(303, '/');
	}
};
