import type { PageServerLoad, Actions } from './$types';
import type {
	Torrent,
	MakeGetStatusRequestResult,
	TorrentInfo,
	MakePauseRequestResult,
	MakeResumeRequestResult,
	MakeRemoveRequestResult
} from './types/_server';
import { transformTorrentInfo } from './helpers/utils/backend';
import { API_BASE_URL } from '$env/static/private';
import { fail } from '@sveltejs/kit';
import { TORRENT_STATUS } from './constants/_server';

let torrentsCache: Torrent[] = [];
function getInMemoryCachedTorrents(): Torrent[] {
	return [...torrentsCache];
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

async function makePauseRequest(
	locals: App.Locals,
	torrentId: string
): Promise<MakePauseRequestResult> {
	const { security, session } = locals;
	security.requireAuth(session);

	try {
		const response = await fetch(`${API_BASE_URL}/api/v1/torrent/pause/${torrentId}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${session.token}`
			}
		});
		if (!response.ok) {
			const parsedResponse = await response.json();

			console.error(parsedResponse);

			return {
				success: false,
				error: {
					status: response.status,
					message: parsedResponse.message ?? 'Pause torrent failed'
				}
			};
		}

		return {
			success: true,
			data: undefined
		};
	} catch (error) {
		console.error(error);

		return {
			success: false,
			error: {
				status: 500,
				message: 'Pause torrent failed'
			}
		};
	}
}

async function makeResumeRequest(
	locals: App.Locals,
	torrentId: string
): Promise<MakeResumeRequestResult> {
	const { security, session } = locals;
	security.requireAuth(session);

	try {
		const response = await fetch(`${API_BASE_URL}/api/v1/torrent/resume/${torrentId}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${session.token}`
			}
		});
		if (!response.ok) {
			const parsedResponse = await response.json();

			console.error(parsedResponse);

			return {
				success: false,
				error: {
					status: response.status,
					message: parsedResponse.message ?? 'Resume torrent failed'
				}
			};
		}

		return {
			success: true,
			data: undefined
		};
	} catch (error) {
		console.error(error);

		return {
			success: false,
			error: {
				status: 500,
				message: 'Resume torrent failed'
			}
		};
	}
}

async function makeRemoveRequest(
	locals: App.Locals,
	torrentId: string
): Promise<MakeRemoveRequestResult> {
	const { security, session } = locals;
	security.requireAuth(session);

	try {
		const response = await fetch(`${API_BASE_URL}/api/v1/torrent/remove/${torrentId}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${session.token}`
			},
			body: JSON.stringify({
				options: {
					shouldDeleteFiles: true
				}
			})
		});

		if (!response.ok) {
			const parsedResponse = await response.json();

			console.error(parsedResponse);

			return {
				success: false,
				error: {
					status: response.status,
					message: parsedResponse.message ?? 'Delete torrent failed'
				}
			};
		}

		return {
			success: true,
			data: undefined
		};
	} catch (error) {
		console.error(error);

		return {
			success: false,
			error: {
				status: 500,
				message: 'Delete torrent failed'
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
		const state = data.get('state') as string;

		if (!torrentId || !state || (state !== 'play' && state !== 'pause')) {
			return fail(400, {
				success: false,
				message: 'Invalid request'
			});
		}

		const shouldMakePauseRequest = state === 'pause';

		const makeRequestResult = shouldMakePauseRequest
			? await makePauseRequest(locals, torrentId)
			: await makeResumeRequest(locals, torrentId);

		if (!makeRequestResult.success) {
			return fail(makeRequestResult.error.status, {
				success: false,
				message: makeRequestResult.error.message
			});
		}

		const torrents = getInMemoryCachedTorrents();
		const updatedTorrent = torrents.find((t) => t.id === torrentId)!;
		updatedTorrent.status = shouldMakePauseRequest
			? TORRENT_STATUS.PAUSED
			: TORRENT_STATUS.DOWNLOADING;

		return { success: true, torrent: updatedTorrent };
	},

	delete: async ({ request, locals }) => {
		const data = await request.formData();
		const torrentId = data.get('torrentId') as string;

		if (!torrentId) {
			return fail(400, {
				success: false,
				message: 'Invalid request'
			});
		}

		const makeRemoveRequestResult = await makeRemoveRequest(locals, torrentId);

		if (!makeRemoveRequestResult.success) {
			return fail(makeRemoveRequestResult.error.status, {
				success: false,
				message: makeRemoveRequestResult.error.message
			});
		}

		torrentsCache = torrentsCache.filter((t) => t.id !== torrentId);

		return { success: true };
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

		return { torrents: getInMemoryCachedTorrents() };
	}
};
