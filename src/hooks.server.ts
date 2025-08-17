import type { Handle } from '@sveltejs/kit';
import { JWT_SECRET } from '$env/static/private';
import { jwtVerify } from 'jose';
import type { Session, User } from '$lib/types/auth';
import { redirect } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get('jwt_token');
	const { pathname } = event.url;

	if (token) {
		try {
			const secret = new TextEncoder().encode(JWT_SECRET);
			const { payload: user } = await jwtVerify<User>(token, secret);
			const session: Session = {
				user,
				token
			};
			event.locals.session = session;
		} catch (err) {
			event.cookies.delete('jwt_token', { path: '/' });
		}
	}

	if (!event.locals.session && pathname !== '/login') {
		throw redirect(307, '/login');
	}

	if (event.locals.session && pathname === '/login') {
		throw redirect(303, '/');
	}

	return resolve(event);
};
