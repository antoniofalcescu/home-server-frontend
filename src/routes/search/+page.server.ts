import type { ActionFailure } from '@sveltejs/kit';
import { fail } from '@sveltejs/kit';
import { API_BASE_URL } from '$env/static/private';
import type { Actions } from './$types';
import type { Session } from '$lib/types/auth';
import type {
	ParsedSearchFormData,
	ParseSearchFormDataResult,
	MakeSearchRequestResult,
	MakeDetailsRequestResult,
	TorrentDetails,
	ParseDownloadFormDataResult,
	MakeDownloadRequestResult,
	SearchActionResponse,
	DownloadActionResponse
} from './types/server.types';

export const actions = {
	search: async ({ request, locals }): Promise<SearchActionResponse> => {
		const session: Session = locals.session;
		const data = await request.formData();

		const parseSearchFormDataResult = parseSearchFormData(data);
		if (!parseSearchFormDataResult.success) {
			return fail(400, { success: false, error: parseSearchFormDataResult.error });
		}
		const { data: searchFormData } = parseSearchFormDataResult;

		const makeSearchRequestResult = await makeSearchRequest(session, searchFormData);
		if (!makeSearchRequestResult.success) {
			const { status, message } = makeSearchRequestResult.error;

			return fail(status, { success: false, error: message });
		}
		const { data: torrentIds } = makeSearchRequestResult;

		const makeDetailsRequestResult = await makeDetailsRequest(session, torrentIds);
		if (!makeDetailsRequestResult.success) {
			const { status, message } = makeDetailsRequestResult.error;

			return fail(status, { success: false, error: message });
		}
		const { data: torrentDetails } = makeDetailsRequestResult;

		const { query, category, sort } = searchFormData;
		const sortedTorrents = sortTorrents(torrentDetails, sort);

		return {
			success: true,
			data: {
				query,
				category,
				sort,
				torrents: sortedTorrents
			}
		};
	},

	download: async ({ request, locals }): Promise<DownloadActionResponse> => {
		const session: Session = locals.session;
		const data = await request.formData();

		const parseDownloadFormDataResult = parseDownloadFormData(data);
		if (!parseDownloadFormDataResult.success) {
			return fail(400, { success: false, error: parseDownloadFormDataResult.error });
		}
		const { data: id } = parseDownloadFormDataResult;

		const makeDownloadRequestResult = await makeDownloadRequest(session, id);
		if (!makeDownloadRequestResult.success) {
			const { status, message } = makeDownloadRequestResult.error;

			return fail(status, { success: false, error: message });
		}
		const { data: message } = makeDownloadRequestResult;

		return {
			success: true,
			data: { message }
		};
	}
} satisfies Actions;
function parseSearchFormData(data: FormData): ParseSearchFormDataResult {
	const query = data.get('query');
	const category = data.get('category');
	const sort = data.get('sort');

	if (!query || typeof query !== 'string' || query.trim().length === 0) {
		return {
			success: false,
			error: 'Please enter a valid search query'
		};
	}

	if (!category || typeof category !== 'string' || category.trim().length === 0) {
		return {
			success: false,
			error: 'Missing or invalid category'
		};
	}

	if (!sort || typeof sort !== 'string' || sort.trim().length === 0) {
		return {
			success: false,
			error: 'Missing or invalid sort order'
		};
	}

	return {
		success: true,
		data: {
			query: query.trim(),
			category,
			sort
		}
	};
}

async function makeSearchRequest(
	session: Session,
	searchFormData: ParsedSearchFormData
): Promise<MakeSearchRequestResult> {
	try {
		const { query } = searchFormData;

		const searchResponse = await fetch(`${API_BASE_URL}/api/v1/torrent/search`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${session.token}`
			},
			body: JSON.stringify({ name: query, searchLimit: 10 })
		});
		const parsedResponse = await searchResponse.json();

		if (!searchResponse.ok) {
			console.error(parsedResponse);

			return {
				success: false,
				error: {
					status: searchResponse.status,
					message: parsedResponse.message ?? 'Search failed'
				}
			};
		}

		return {
			success: true,
			data: parsedResponse.torrents ?? []
		};
	} catch (error) {
		console.error(error);

		return {
			success: false,
			error: {
				status: 500,
				message: 'Search failed'
			}
		};
	}
}

async function makeDetailsRequest(
	session: Session,
	torrentIds: string[]
): Promise<MakeDetailsRequestResult> {
	try {
		const detailsResponse = await fetch(
			`${API_BASE_URL}/api/v1/torrent/details?ids=${torrentIds.join(',')}`,
			{
				headers: {
					Authorization: `Bearer ${session.token}`
				}
			}
		);

		const parsedResponse = await detailsResponse.json();

		if (!detailsResponse.ok) {
			return {
				success: false,
				error: {
					status: detailsResponse.status,
					message: parsedResponse.message ?? 'Failed to fetch torrent details'
				}
			};
		}

		const torrens = parsedResponse.details.map((item: any) => ({
			id: item.id,
			title: item.title,
			poster: item.poster,
			description: item.description,
			category: item.genre,
			size: item.size,
			downloads: item.snatches,
			date: new Date(item.date)
		}));

		return {
			success: true,
			data: torrens
		};
	} catch (error) {
		console.error(error);

		return {
			success: false,
			error: {
				status: 500,
				message: 'Failed to fetch torrent details'
			}
		};
	}
}

function sortTorrents(torrents: TorrentDetails[], sort: string) {
	switch (sort) {
		case 'date':
			return torrents.sort((a, b) => b.date.getTime() - a.date.getTime());
		// TODO: size is string and can't be sorted properly
		// case 'size':
		// 	results.sort((a: any, b: any) => b.size - a.size);
		case 'downloads':
			return torrents.sort((a, b) => b.downloads - a.downloads);
		default:
			return torrents.sort((a, b) => b.title.localeCompare(a.title));
	}
}

function parseDownloadFormData(data: FormData): ParseDownloadFormDataResult {
	const id = data.get('id');

	if (!id || typeof id !== 'string' || id.trim().length === 0) {
		return {
			success: false,
			error: 'Please enter a valid torrent ID'
		};
	}

	return {
		success: true,
		data: id.trim()
	};
}

async function makeDownloadRequest(
	session: Session,
	id: string
): Promise<MakeDownloadRequestResult> {
	try {
		const downloadResponse = await fetch(`${API_BASE_URL}/api/v1/torrent/download`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${session.token}`
			},
			body: JSON.stringify({ id })
		});
		const parsedResponse = await downloadResponse.json();

		if (!downloadResponse.ok) {
			console.error(parsedResponse);

			return {
				success: false,
				error: {
					status: downloadResponse.status,
					message: parsedResponse.message ?? 'Download failed'
				}
			};
		}

		return {
			success: true,
			data: 'Download started successfully.'
		};
	} catch (error) {
		console.error(error);

		return {
			success: false,
			error: {
				status: 500,
				message: 'Download failed'
			}
		};
	}
}
