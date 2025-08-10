type SearchState = {
	query: string;
	isSearching: boolean;
	selectedCategory: string;
	selectedSort: string;
};

export type Props = {
	searchState: SearchState;
	onSearchEnhance: (args: { formData: FormData }) => any;
	onClearFilters: () => void;
};
