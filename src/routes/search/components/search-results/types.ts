type SearchResult = {
	id: string;
	title: string;
	description: string;
	poster: string;
	category: string;
	size: string;
	downloads: string;
	date: string;
};

export type Props = {
	query: string;
	category?: string | undefined;
	sort?: string | undefined;
	results: SearchResult[];
};
