<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { enhance } from '$app/forms';
	import { ChevronDown, Download, Search, CheckCircle, XCircle } from 'lucide-svelte';
	import type { ActionData } from './$types';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { SelectButton } from '$lib/components/buttons';
	import { Spring, Tween, prefersReducedMotion } from 'svelte/motion';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Carousel from '$lib/components/ui/carousel';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';

	let { form }: { form: ActionData } = $props();

	let query = $state('');
	let isSearching = $state(false);
	let isDownloading = $state<{ [key: string]: boolean }>({});
	let selectedCategory = $state('all');
	let selectedSort = $state('relevance');
	let showFilters = $state(false);

	// Toast notification state with motion
	let toasts = $state<
		Array<{
			id: string;
			type: 'success' | 'error';
			message: string;
			yPosition: Spring<number>;
			opacity: Tween<number>;
		}>
	>([]);

	// Function to show toast
	function showToast(type: 'success' | 'error', message: string) {
		const id = Math.random().toString(36).substr(2, 9);

		// Create motion instances for this toast
		const shouldReduceMotion = prefersReducedMotion.current;
		const yPosition = new Spring(shouldReduceMotion ? 0 : 100, {
			stiffness: 0.3,
			damping: 0.8
		});
		const opacity = new Tween(0, {
			duration: shouldReduceMotion ? 0 : 400
		});

		const toast = { id, type, message, yPosition, opacity };
		toasts.push(toast);

		// Animate in
		setTimeout(() => {
			yPosition.target = 0;
			opacity.target = 1;
		}, 50);

		// Auto-dismiss after 4 seconds
		setTimeout(() => {
			const toastIndex = toasts.findIndex((t) => t.id === id);
			if (toastIndex !== -1) {
				// Animate out (opposite direction of entrance)
				yPosition.target = shouldReduceMotion ? 0 : 100;
				opacity.target = 0;

				// Remove from array after animation
				setTimeout(
					() => {
						const index = toasts.findIndex((t) => t.id === id);
						if (index !== -1) {
							toasts.splice(index, 1);
						}
					},
					shouldReduceMotion ? 0 : 500
				);
			}
		}, 4000);
	}

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

<!-- TODO: Check toast fade out animation, ask AI to explain class/style code and extract into a separate reusable component -->
<!-- TODO: check the download code -->
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
			return async ({ result: actionResult, update }) => {
				isSearching = false;

				if (actionResult.type === 'failure' && actionResult.data) {
					const data = actionResult.data as { error?: string; searchError?: string };
					const errorMessage = data.error || data.searchError || 'Search failed';
					showToast('error', errorMessage);
					// Don't call update() to prevent page refresh for errors
				} else {
					// Call update() for successful searches to show results
					await update();
				}
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
						<Carousel.Item class="basis-full">
							<div class="p-1">
								<Card.Root class="overflow-hidden">
									<div class="grid h-full grid-cols-1 md:grid-cols-5">
										<div class="md:col-span-2">
											<img
												src={result.poster}
												alt={`Poster for ${result.title}`}
												class="h-full w-full object-cover"
											/>
										</div>
										<div class="md:col-span-3">
											<Card.Header>
												<Card.Title class="text-xl font-bold">{result.title}</Card.Title>
											</Card.Header>
											<Card.Content class="grid gap-2 p-4">
												<p class="line-clamp-3 text-sm text-gray-500">
													{result.description}
												</p>
												<div
													class="text-muted-foreground flex flex-wrap items-center gap-2 text-xs"
												>
													<Badge variant="secondary" class="px-2 py-0.5">{result.category}</Badge>
													<Badge variant="outline" class="px-2 py-0.5">Size: {result.size}</Badge>
													<Badge variant="outline" class="px-2 py-0.5"
														>Downloads: {result.downloads}</Badge
													>
													<Badge variant="outline" class="px-2 py-0.5"
														>Date: {new Date(result.date).toLocaleDateString()}</Badge
													>
												</div>
											</Card.Content>
											<Card.Footer class="p-4 pt-0">
												<form
													method="POST"
													action="?/download"
													use:enhance={() => {
														isDownloading[result.id] = true;
														return async ({ result: actionResult, update }) => {
															isDownloading[result.id] = false;

															if (
																actionResult.type === 'success' &&
																actionResult.data &&
																'downloadSuccess' in actionResult.data
															) {
																const data = actionResult.data as {
																	downloadSuccess: boolean;
																	message?: string;
																};
																showToast(
																	'success',
																	data.message || 'Download started successfully'
																);
															} else if (actionResult.type === 'failure' && actionResult.data) {
																const data = actionResult.data as { downloadError?: string };
																showToast('error', data.downloadError || 'Download failed');
															}
														};
													}}
													class="w-full"
												>
													<input type="hidden" name="id" value={result.id} />
													<Button type="submit" class="w-full" disabled={isDownloading[result.id]}>
														<Download class="mr-2 h-4 w-4" />
														<span>Download</span>
													</Button>
												</form>
											</Card.Footer>
										</div>
									</div>
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

<!-- Toast Notifications -->
{#if toasts.length > 0}
	<div class="fixed right-1 bottom-1 z-50 flex flex-col-reverse gap-2">
		{#each toasts as toast (toast.id)}
			<div
				style="transform: translateY({toast.yPosition.current}px) scale({0.95 +
					toast.opacity.current * 0.05}); opacity: {toast.opacity.current};"
				class="transform-gpu will-change-transform"
			>
				<Alert
					variant={toast.type === 'error' ? 'destructive' : 'default'}
					class="max-w-sm min-w-80 shadow-lg {toast.type === 'success'
						? 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200'
						: ''}"
				>
					{#snippet children()}
						{#if toast.type === 'success'}
							<CheckCircle class="h-4 w-4 text-green-600 dark:text-green-400" />
						{:else}
							<XCircle class="h-4 w-4" />
						{/if}
						<AlertDescription>
							{toast.message}
						</AlertDescription>
					{/snippet}
				</Alert>
			</div>
		{/each}
	</div>
{/if}
