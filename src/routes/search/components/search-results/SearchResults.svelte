<script lang="ts">
	import { enhance } from '$app/forms';
	import { Download } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as Carousel from '$lib/components/ui/carousel';
	import * as Card from '$lib/components/ui/card';
	import { Toast } from '$lib/components/layout';
	import type { Props } from './types';

	let { query, category, sort, results }: Props = $props();

	let toastComponent: Toast;
	let isDownloading = $state<{ [key: string]: boolean }>({});
</script>

<div class="mb-4">
	<h2 class="mb-2 text-xl font-semibold">Results for "{query}"</h2>
	{#if category && category !== 'all'}
		<p class="text-muted-foreground text-sm">
			Filtered by category: <span class="font-medium">{category}</span>
		</p>
	{/if}
	{#if sort}
		<p class="text-muted-foreground text-sm">
			Sorted by: <span class="font-medium capitalize">{sort}</span>
		</p>
	{/if}
</div>

<Carousel.Root class="w-full">
	<Carousel.Content>
		{#if results.length > 0}
			{#each results as result}
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
										<div class="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
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
											use:enhance={({ formData }) => {
												formData.set('id', result.id);
												isDownloading[result.id] = true;
												return async ({ result: actionResult }) => {
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
														toastComponent.showToast(
															'success',
															data.message || 'Download started successfully'
														);
													} else if (actionResult.type === 'failure' && actionResult.data) {
														const data = actionResult.data as { downloadError?: string };
														toastComponent.showToast(
															'error',
															data.downloadError || 'Download failed'
														);
													}
												};
											}}
											class="w-full"
										>
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
		{/if}
	</Carousel.Content>
	<Carousel.Previous />
	<Carousel.Next />
</Carousel.Root>

<Toast bind:this={toastComponent} />
