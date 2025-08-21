<script lang="ts">
	import type { ActionData } from './$types';
	import { Toast } from '$lib/components/layout';
	import { SearchResults, SearchForm } from './components';
	import type { SearchActionData } from './types/_server';

	let { form }: { form: ActionData } = $props();

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
		return async ({ result, update }: any) => {
			searchState.isSearching = false;

			const { data } = result;
			if (!data.success) {
				toastComponent.showToast('error', data.error);
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
		<SearchResults data={form.data as SearchActionData} />
	{/if}
</div>

<Toast bind:this={toastComponent} />
