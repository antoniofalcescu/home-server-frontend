<script lang="ts">
	import type { ActionData } from './$types';
	import { Toast } from '$lib/components/layout';
	import { SearchResults, SearchForm } from './components';

	let { form }: { form: ActionData } = $props();

	// Consolidated search state object
	let searchState = $state({
		query: '',
		isSearching: false,
		selectedCategory: 'all',
		selectedSort: 'relevance'
	});

	let toastComponent: Toast;

	function handleSearchEnhance({ formData }: { formData: FormData }) {
		formData.set('category', searchState.selectedCategory);
		if (searchState.selectedSort) {
			formData.set('sort', searchState.selectedSort);
		}

		searchState.isSearching = true;
		return async ({ result: actionResult, update }: any) => {
			searchState.isSearching = false;

			if (actionResult.type === 'failure' && actionResult.data) {
				const data = actionResult.data as { error?: string; searchError?: string };
				const errorMessage = data.error || data.searchError || 'Search failed';
				toastComponent.showToast('error', errorMessage);
			} else {
				await update();
			}
		};
	}

	function clearFilters() {
		searchState.selectedCategory = 'all';
		searchState.selectedSort = 'relevance';
	}
</script>

<div class="container mx-auto p-4">
	<h1 class="mb-4 text-2xl font-bold">Search Page</h1>

	<SearchForm
		bind:searchState
		onSearchEnhance={handleSearchEnhance}
		onClearFilters={clearFilters}
	/>

	{#if form?.success}
		<SearchResults
			query={String(form.query || '')}
			category={form.category ? String(form.category) : undefined}
			sort={form.sort ? String(form.sort) : undefined}
			results={form.results || []}
		/>
	{/if}
</div>

<Toast bind:this={toastComponent} />
