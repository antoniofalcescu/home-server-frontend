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
				category: 'books',
				size: 100,
				downloads: 50,
				peers: 10,
				date: new Date('2023-01-15')
			},
			{
				id: 2,
				title: `Result for "${query}" 2`,
				description: 'This is another dummy result in movies.',
				category: 'movies',
				size: 200,
				downloads: 100,
				peers: 20,
				date: new Date('2023-02-20')
			},
			{
				id: 3,
				title: `Result for "${query}" 3`,
				description: 'Yet another dummy result in music.',
				category: 'music',
				size: 50,
				downloads: 200,
				peers: 5,
				date: new Date('2023-03-25')
			},
			{
				id: 4,
				title: `Result for "${query}" 4`,
				description: 'Another book result.',
				category: 'books',
				size: 120,
				downloads: 30,
				peers: 15,
				date: new Date('2023-04-10')
			},
			{
				id: 5,
				title: `Result for "${query}" 5`,
				description: 'Another movie result.',
				category: 'movies',
				size: 250,
				downloads: 150,
				peers: 25,
				date: new Date('2023-05-05')
			}
		];

		// Filter by category only if it's not "all"
		if (category && category !== 'all') {
			dummyResults = dummyResults.filter((result) => result.category === category);
		}

		// Sort results
		switch (sort) {
			case 'date':
				dummyResults.sort((a, b) => b.date.getTime() - a.date.getTime());
				break;
			case 'size':
				dummyResults.sort((a, b) => b.size - a.size);
				break;
			case 'downloads':
				dummyResults.sort((a, b) => b.downloads - a.downloads);
				break;
			case 'peers':
				dummyResults.sort((a, b) => b.peers - a.peers);
				break;
			default:
				// Default to relevance or no sorting
				dummyResults.sort((a, b) => b.title.localeCompare(a.title));
				break;
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
