<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { enhance } from '$app/forms';
	import { AlertTriangle, Search, ChevronDown, ChevronUp } from 'lucide-svelte';
	import type { ActionData } from './$types';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import * as Select from '$lib/components/ui/select';

	let { form }: { form: ActionData } = $props();

	let query = $state('');
	let isSearching = $state(false);
	let selectedCategory = $state('all');
	let selectedSort = $state<string | undefined>(undefined);
	let showFilters = $state(false);

	const categories = [
		{ value: 'all', label: 'All Categories' },
		{ value: 'movies', label: 'Movies' },
		{ value: 'music', label: 'Music' },
		{ value: 'books', label: 'Books' }
	];

	const sortOptions = [
		{ value: 'asc', label: 'Ascending' },
		{ value: 'desc', label: 'Descending' }
	];

	const getCategoryLabel = (value: string) =>
		categories.find((cat) => cat.value === value)?.label || 'Select a category';

	const getSortLabel = (value: string | undefined) =>
		sortOptions.find((sort) => sort.value === value)?.label || 'Select an order';
</script>

<!-- TODO:
  Check what can be refactored in the current code
  Refactor and make filters menu prettier
  Add carousel component with dummy data
  Check what can be extracted into separate components
  Add error handling
  Add success handling
  Add loading state
  Add no results state
-->

<div class="container mx-auto p-4">
	<h1 class="mb-4 text-2xl font-bold">Search Page</h1>

	<form
		method="POST"
		action="?/search"
		class="mb-4"
		use:enhance={() => {
			isSearching = true;
			return async ({ update }) => {
				await update();
				isSearching = false;
			};
		}}
	>
		<!-- Search bar and buttons -->
		<div class="mb-2 flex items-center gap-2">
			<div class="relative w-full">
				<Input
					type="search"
					name="query"
					placeholder="Search..."
					class="pl-10"
					bind:value={query}
				/>
				<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
					<Search class="text-muted-foreground h-5 w-5" />
				</div>
			</div>

			<Button
				type="submit"
				disabled={isSearching}
				class={`${isSearching ? 'cursor-progress' : 'cursor-pointer'}`}
			>
				{#if isSearching}
					Searching...
				{:else}
					Search
				{/if}
			</Button>

			<!-- Filters toggle button -->
			<Button
				type="button"
				variant="outline"
				class="flex items-center gap-2"
				onclick={() => (showFilters = !showFilters)}
			>
				Filters
				{#if showFilters}
					<ChevronUp class="h-4 w-4" />
				{:else}
					<ChevronDown class="h-4 w-4" />
				{/if}
			</Button>
		</div>

		<!-- Collapsible filters section -->
		{#if showFilters}
			<div class="bg-muted/50 animate-in slide-in-from-top-2 rounded-lg border p-4 duration-200">
				<div class="flex flex-wrap items-center gap-4">
					<div class="flex flex-col gap-2">
						<label for="category-select" class="text-sm font-medium">Category</label>
						<Select.Root name="category" type="single" bind:value={selectedCategory}>
							<Select.Trigger class="w-40" id="category-select">
								{getCategoryLabel(selectedCategory)}
							</Select.Trigger>
							<Select.Content>
								{#each categories as category}
									<Select.Item value={category.value}>{category.label}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>

					<div class="flex flex-col gap-2">
						<label for="sort-select" class="text-sm font-medium">Sort by</label>
						<Select.Root name="sort" type="single" bind:value={selectedSort}>
							<Select.Trigger class="w-32" id="sort-select">
								{getSortLabel(selectedSort)}
							</Select.Trigger>
							<Select.Content>
								{#each sortOptions as sortOption}
									<Select.Item value={sortOption.value}>{sortOption.label}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>

					<!-- Clear filters button -->
					<div class="flex flex-col justify-end">
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onclick={() => {
								selectedCategory = 'all';
								selectedSort = undefined;
							}}
						>
							Clear Filters
						</Button>
					</div>
				</div>
			</div>
		{/if}
	</form>

	{#if form?.error}
		<Alert variant="destructive" class="mb-4">
			<AlertTriangle class="h-4 w-4" />
			<AlertDescription>{form.error}</AlertDescription>
		</Alert>
	{/if}

	{#if form?.success}
		<div class="mb-4">
			<h2 class="mb-2 text-xl font-semibold">Results for "{form.query}"</h2>
			{#if form.category && form.category !== 'all'}
				<p class="text-muted-foreground text-sm">
					Filtered by category: <span class="font-medium">{form.category}</span>
				</p>
			{/if}
			{#if form.sort}
				<p class="text-muted-foreground text-sm">
					Sorted: <span class="font-medium">{form.sort === 'asc' ? 'Ascending' : 'Descending'}</span
					>
				</p>
			{/if}
		</div>
		<ul class="space-y-2">
			{#if form.results.length > 0}
				{#each form.results as result}
					<li class="rounded-md border p-4">
						<h3 class="font-bold">{result.title}</h3>
						<p>{result.description}</p>
						<span
							class="text-muted-foreground bg-muted mt-2 inline-block rounded px-2 py-1 text-xs"
						>
							{result.category}
						</span>
					</li>
				{/each}
			{:else}
				<p>No results found for the selected filters.</p>
			{/if}
		</ul>
	{/if}
</div>
