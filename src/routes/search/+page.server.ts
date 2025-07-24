import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

// TODO: Define realistic dummy data for the search results
// TODO: on Node BE I should implement a GET by ids to get the needed details here to show in the carousel
export const actions = {
	search: async ({ request }) => {
		const data = await request.formData();
		const query = data.get('query');
		const category = data.get('category');
		const sort = data.get('sort');

		console.log('Form data:', { query, category, sort });

		if (!query || typeof query !== 'string' || query.trim().length === 0) {
			return fail(400, { query, error: 'Please enter a search query.' });
		}

		// Dummy data generation
		let dummyResults = [
			{
				id: 1,
				title: `Result for "${query}" 1`,
				description: 'This is a dummy result in books.',
				category: 'books'
			},
			{
				id: 2,
				title: `Result for "${query}" 2`,
				description: 'This is another dummy result in movies.',
				category: 'movies'
			},
			{
				id: 3,
				title: `Result for "${query}" 3`,
				description: 'Yet another dummy result in music.',
				category: 'music'
			},
			{
				id: 4,
				title: `Result for "${query}" 4`,
				description: 'Another book result.',
				category: 'books'
			},
			{
				id: 5,
				title: `Result for "${query}" 5`,
				description: 'Another movie result.',
				category: 'movies'
			}
		];

		// Filter by category only if it's not "all"
		if (category && category !== 'all') {
			dummyResults = dummyResults.filter((result) => result.category === category);
		}

		// Sort results
		if (sort === 'asc') {
			dummyResults.sort((a, b) => a.title.localeCompare(b.title));
		} else if (sort === 'desc') {
			dummyResults.sort((a, b) => b.title.localeCompare(a.title));
		}

		// Simulate network latency
		await new Promise((resolve) => setTimeout(resolve, 500));

		return {
			success: true,
			query,
			category,
			sort,
			results: dummyResults
		};
	}
} satisfies Actions;
