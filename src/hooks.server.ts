import type { Handle } from '@sveltejs/kit';
import { JWT_SECRET } from '$env/static/private';
import { jwtVerify } from 'jose';
import type { Session, User } from '$lib/types/auth';
import { error, redirect } from '@sveltejs/kit';

function requireAuth(session: Session): void {
	if (!session?.token) {
		throw error(401, { message: 'Unauthorized' });
	}
}

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
			event.locals.security = { requireAuth };
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
