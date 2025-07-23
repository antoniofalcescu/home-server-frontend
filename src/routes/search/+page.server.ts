import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

// TODO: Define realistic dummy data for the search results
// TODO: on Node BE I should implement a GET by ids to get the needed details here to show in the carousel
export const actions = {
	search: async ({ request }) => {
		const data = await request.formData();
		const query = data.get('query');

		if (!query || typeof query !== 'string' || query.trim().length === 0) {
			return fail(400, { query, error: 'Please enter a search query.' });
		}

		// Dummy data generation
		const dummyResults = [
			{ id: 1, title: `Result for "${query}" 1`, description: 'This is a dummy result.' },
			{ id: 2, title: `Result for "${query}" 2`, description: 'This is another dummy result.' },
			{ id: 3, title: `Result for "${query}" 3`, description: 'Yet another dummy result.' }
		];

		// Simulate network latency
		await new Promise((resolve) => setTimeout(resolve, 500));

		return {
			success: true,
			query,
			results: dummyResults
		};
	}
} satisfies Actions;
