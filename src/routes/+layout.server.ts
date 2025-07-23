import type { LayoutServerLoad } from './$types';
import type { Session, User } from '$lib/types/auth';
import { redirect } from '@sveltejs/kit';
import { JWT_SECRET } from '$env/static/private';
import { jwtVerify } from 'jose';

export const load: LayoutServerLoad = async ({ cookies, url }) => {
	const token = cookies.get('jwt_token');
	const { pathname } = url;

	if (!token) {
		if (pathname !== '/login') {
			throw redirect(307, '/login');
		}
		return { session: null };
	}

	try {
		const secret = new TextEncoder().encode(JWT_SECRET);
		const { payload: user } = await jwtVerify<User>(token, secret);

		const session: Session = {
			user,
			token
		};

		return { session };
	} catch (err) {
		cookies.delete('jwt_token', { path: '/' });

		if (pathname !== '/login') {
			throw redirect(307, '/login');
		}

		return { session: null };
	}
};
