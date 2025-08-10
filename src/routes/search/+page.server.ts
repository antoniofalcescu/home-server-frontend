import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import type { Session } from '$lib/types/auth';

const BACKEND_API_URL = 'http://localhost:3000/api/v1'; // TODO: move to env var

// TODO: check what happens here and refactor and cleanup and handle errors
export const actions = {
	search: async ({ request, locals }) => {
		const session: Session = locals.session;
		const data = await request.formData();
		const query = data.get('query');
		const category = data.get('category');
		const sort = data.get('sort');

		console.log('Form data:', { query, category, sort });

		if (!query || typeof query !== 'string' || query.trim().length === 0) {
			return fail(400, { query, error: 'Please enter a search query.' });
		}

		try {
			// Step 1: Search for torrents by name
			const searchResponse = await fetch(`${BACKEND_API_URL}/torrent/search`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${session.token}`
				},
				body: JSON.stringify({ name: query, searchLimit: 10 })
			});

			if (!searchResponse.ok) {
				const errorData = await searchResponse.json();
				return fail(searchResponse.status, {
					query,
					searchError: errorData.message || 'Search failed'
				});
			}

			const searchResult = await searchResponse.json();
			const torrentIds = searchResult.torrents;

			if (!torrentIds || torrentIds.length === 0) {
				return {
					success: true,
					query,
					category,
					sort,
					results: []
				};
			}

			// Step 2: Fetch details for the found torrents
			const detailsResponse = await fetch(
				`${BACKEND_API_URL}/torrent/details?ids=${torrentIds.join(',')}`,
				{
					headers: {
						Authorization: `Bearer ${session.token}`
					}
				}
			);

			if (!detailsResponse.ok) {
				const errorData = await detailsResponse.json();
				return fail(detailsResponse.status, {
					query,
					searchError: errorData.message || 'Failed to fetch torrent details'
				});
			}

			const detailsResult = await detailsResponse.json();

			let results = detailsResult.details.map((item: any) => ({
				id: item.id,
				title: item.title,
				poster: item.poster,
				description: item.description,
				category: item.genre,
				size: item.size,
				downloads: item.snatches,
				date: new Date(item.date)
			}));

			console.log(results);

			// Sort results
			switch (sort) {
				case 'date':
					results.sort((a: any, b: any) => b.date.getTime() - a.date.getTime());
					break;
				// TODO: size is string and can't be sorted properly
				// case 'size':
				// 	results.sort((a: any, b: any) => b.size - a.size);
				// 	break;
				case 'downloads':
					results.sort((a: any, b: any) => b.downloads - a.downloads);
					break;
				default:
					// Default to relevance or no sorting
					results.sort((a: any, b: any) => b.title.localeCompare(a.title));
					break;
			}

			return {
				success: true,
				query,
				category,
				sort,
				results: results
			};
		} catch (error: any) {
			return fail(500, { query, searchError: error.message || 'An unexpected error occurred' });
		}
	},
	download: async ({ request, locals }) => {
		const session: Session = locals.session;
		const data = await request.formData();
		const id = data.get('id');

		if (!id || typeof id !== 'string') {
			return fail(400, { downloadError: 'Invalid torrent ID.' });
		}

		try {
			const downloadResponse = await fetch(`${BACKEND_API_URL}/torrent/download`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${session.token}`
				},
				body: JSON.stringify({ id })
			});

			if (!downloadResponse.ok) {
				const errorData = await downloadResponse.json();
				return fail(downloadResponse.status, {
					downloadError: errorData.message || 'Download failed'
				});
			}

			return { downloadSuccess: true, message: 'Download started successfully.' };
		} catch (error: any) {
			return fail(500, { downloadError: error.message || 'An unexpected error occurred' });
		}
	}
} satisfies Actions;
