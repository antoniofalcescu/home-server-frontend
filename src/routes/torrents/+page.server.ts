import type { PageServerLoad, Actions } from './$types';
import type { Torrent, MakeGetStatusRequestResult, TorrentInfo } from './types/_server';
import { transformTorrentInfo } from './helpers/utils/_server';
import { API_BASE_URL } from '$env/static/private';
import { fail } from '@sveltejs/kit';

let torrentsCache: Torrent[] = [];
function getInMemoryCachedTorrents(): Torrent[] {
	return [...torrentsCache]; // Return a copy to prevent external mutations
}

function updateInMemoryCacheTorrents(torrentsInfo: TorrentInfo[]): void {
	const torrents = torrentsInfo.map(transformTorrentInfo);
	torrentsCache = torrents;
}

async function makeGetStatusRequest(locals: App.Locals): Promise<MakeGetStatusRequestResult> {
	const { security, session } = locals;
	security.requireAuth(session);

	try {
		const response = await fetch(`${API_BASE_URL}/api/v1/torrent/status`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${session.token}`
			}
		});
		const parsedResponse = await response.json();

		if (!response.ok) {
			console.error(parsedResponse);

			return {
				success: false,
				error: {
					status: response.status,
					message: parsedResponse.message ?? 'Get status failed'
				}
			};
		}

		return {
			success: true,
			data: parsedResponse.torrents
		};
	} catch (error) {
		console.error(error);

		return {
			success: false,
			error: {
				status: 500,
				message: 'Get status failed'
			}
		};
	}
}

export const load: PageServerLoad = async ({ locals }) => {
	const makeGetStatusRequestResult = await makeGetStatusRequest(locals);

	if (!makeGetStatusRequestResult.success) {
		return fail(makeGetStatusRequestResult.error.status, {
			success: false,
			message: makeGetStatusRequestResult.error.message
		});
	}

	const { data: torrentsInfo } = makeGetStatusRequestResult;
	updateInMemoryCacheTorrents(torrentsInfo);

	return { torrents: getInMemoryCachedTorrents() };
};

export const actions: Actions = {
	toggle: async ({ request, locals }) => {
		const data = await request.formData();
		const torrentId = data.get('torrentId') as string;
		const state = (data.get('state') as string) ?? '';

		const { security, session } = locals;
		security.requireAuth(session);

		if (!torrentId || (state !== 'play' && state !== 'pause')) {
			return fail(400, {
				success: false,
				message: 'Invalid request'
			});
		}

		const endpoint = state === 'pause' ? 'pause' : 'resume';
		const url = `${API_BASE_URL}/api/v1/torrent/${endpoint}/${torrentId}`;

		try {
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${session.token}`
				}
			});

			if (!response.ok) {
				const parsed = await response.json().catch(() => ({}));
				return fail(response.status, {
					success: false,
					message: parsed.message ?? 'Toggle torrent failed'
				});
			}

			// Update cache to reflect new state
			torrentsCache = torrentsCache.map((t) => {
				if (t.id !== torrentId) return t;
				if (state === 'pause') return { ...t, status: 'paused' } as Torrent;
				// play => resume: if previously completed/seeding keep it, otherwise mark downloading
				const nextStatus =
					t.status === 'completed' || t.status === 'seeding' ? t.status : 'downloading';
				return { ...t, status: nextStatus } as Torrent;
			});

			return { success: true, torrents: torrentsCache };
		} catch (error) {
			console.error(error);
			return fail(500, { success: false, message: 'Toggle torrent failed' });
		}
	},

	delete: async ({ request }) => {
		const data = await request.formData();
		const torrentId = data.get('torrentId') as string;

		// Optimistically update cache
		torrentsCache = torrentsCache.filter((t) => t.id !== torrentId);

		// TODO: In a real implementation, you might want to make an API call to the backend
		// to actually delete the torrent from qBittorrent
		// For now, we're just updating the cache optimistically

		return {
			success: true,
			torrents: torrentsCache
		};
	},

	convert: async ({ request }) => {
		const data = await request.formData();
		const torrentId = data.get('torrentId') as string;
		const deleteAfterConvert = data.get('deleteAfterConvert') === 'true';
		const type = data.get('type');

		// Log the type for now as requested
		console.log('Torrent type:', type);

		// In a real app, this would:
		// 1. Move/copy files to Jellyfin directory based on type (movie/tvShow)
		// 2. Update Jellyfin library
		// 3. Optionally remove torrent based on deleteAfterConvert flag

		if (deleteAfterConvert) {
			// Optimistically remove the torrent if user opted to delete after conversion
			torrentsCache = torrentsCache.filter((t) => t.id !== torrentId);
			return {
				success: true,
				message: 'Torrent converted to Jellyfin format and deleted',
				torrents: torrentsCache
			};
		} else {
			// Optimistically keep the torrent but mark it as completed/seeding
			torrentsCache = torrentsCache.map((t) =>
				t.id === torrentId ? { ...t, status: 'seeding' as const } : t
			);
			return {
				success: true,
				message: 'Torrent converted to Jellyfin format',
				torrents: torrentsCache
			};
		}
	},

	sync: async ({ locals }) => {
		const makeGetStatusRequestResult = await makeGetStatusRequest(locals);

		if (!makeGetStatusRequestResult.success) {
			return fail(makeGetStatusRequestResult.error.status, {
				success: false,
				message: makeGetStatusRequestResult.error.message
			});
		}

		const { data: torrentsInfo } = makeGetStatusRequestResult;
		updateInMemoryCacheTorrents(torrentsInfo);

		console.log('Raw torrents info:', torrentsInfo);
		console.log('Cached torrents:', getInMemoryCachedTorrents());

		return { torrents: getInMemoryCachedTorrents() };
	}
};
