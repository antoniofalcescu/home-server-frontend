<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { enhance } from '$app/forms';
	import { AlertTriangle, ChevronDown, Search } from 'lucide-svelte';
	import type { ActionData } from './$types';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { SelectButton } from '$lib/components/buttons';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Carousel from '$lib/components/ui/carousel';
	import * as Card from '$lib/components/ui/card';

	let { form }: { form: ActionData } = $props();

	let query = $state('');
	let isSearching = $state(false);
	let selectedCategory = $state('all');
	let selectedSort = $state('relevance');
	let showFilters = $state(false);

	const categories = [
		{ value: 'all', label: 'All Categories' },
		{ value: 'movies', label: 'Movies' },
		{ value: 'music', label: 'Music' },
		{ value: 'books', label: 'Books' }
	];

	const sortOptions = [
		{ value: 'relevance', label: 'Relevance' },
		{ value: 'date', label: 'Date' },
		{ value: 'size', label: 'Size' },
		{ value: 'downloads', label: 'Downloads' },
		{ value: 'peers', label: 'Peers' }
	];
</script>

<div class="container mx-auto p-4">
	<h1 class="mb-4 text-2xl font-bold">Search Page</h1>

	<form
		method="POST"
		action="?/search"
		class="mb-4"
		use:enhance={({ formData }) => {
			formData.set('category', selectedCategory);
			if (selectedSort) {
				formData.set('sort', selectedSort);
			}

			isSearching = true;
			return async ({ update }) => {
				await update();
				isSearching = false;
			};
		}}
	>
		<!-- Search bar and buttons -->
		<div class="flex items-start gap-2">
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

			<!-- DropdownMenu for filters -->
			<DropdownMenu.Root bind:open={showFilters}>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
						<Button
							{...props}
							type="button"
							variant="outline"
							class="group flex items-center gap-2"
						>
							Filters
							<ChevronDown
								class="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180"
							/>
						</Button>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content class="w-64" align="end">
					<div class="flex flex-col gap-4 p-4">
						<SelectButton label="Category" options={categories} bind:value={selectedCategory} />
						<SelectButton label="Sort by" options={sortOptions} bind:value={selectedSort} />

						<div class="-mx-4 my-2 border-t"></div>

						<Button
							type="button"
							variant="ghost"
							class="w-full"
							size="sm"
							onclick={() => {
								selectedCategory = 'all';
								selectedSort = 'relevance';
							}}
						>
							Clear Filters
						</Button>
					</div>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
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
					Sorted by: <span class="font-medium capitalize">{form.sort}</span>
				</p>
			{/if}
		</div>
		<Carousel.Root class="w-full">
			<Carousel.Content>
				{#if form.results.length > 0}
					{#each form.results as result, i}
						<Carousel.Item class="md:basis-1/2 lg:basis-1/3">
							<div class="p-1">
								<Card.Root>
									<Card.Header>
										<Card.Title>{result.title}</Card.Title>
									</Card.Header>
									<Card.Content class="grid gap-4">
										<p>{result.description}</p>
										<div class="text-muted-foreground flex flex-wrap gap-2 text-xs">
											<span class="bg-muted rounded px-2 py-1">
												{result.category}
											</span>
											<span>Size: {result.size} MB</span>
											<span>Downloads: {result.downloads}</span>
											<span>Peers: {result.peers}</span>
											<span>Date: {new Date(result.date).toLocaleDateString()}</span>
										</div>
									</Card.Content>
								</Card.Root>
							</div>
						</Carousel.Item>
					{/each}
				{:else}
					<div class="flex h-48 w-full items-center justify-center">
						<p>No results found for the selected filters.</p>
					</div>
				{/if}
			</Carousel.Content>
			<Carousel.Previous />
			<Carousel.Next />
		</Carousel.Root>
	{/if}
</div>
