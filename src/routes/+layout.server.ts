import type { LayoutServerLoad } from './$types';
import type { Session, User } from '$lib/types/auth';
import { redirect } from '@sveltejs/kit';
import { decodeJwt } from 'jose';

export const load: LayoutServerLoad = async ({ cookies, url }) => {
	const token = cookies.get('jwt_token');
	const { pathname } = url;

	if (!token) {
		if (pathname !== '/login') {
			throw redirect(307, '/login');
		}
		return { session: null };
	}

	const user = decodeJwt<User>(token);
	const session: Session = {
		user,
		token
	};

	return { session };
};
