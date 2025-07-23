<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { enhance } from '$app/forms';
	import { Search } from 'lucide-svelte';
	import type { ActionData } from './$types';

	export let form: ActionData;

	let query = '';
	let isSearching = false;
</script>

<!-- TODO:
  Check why buttons component don't have click mouse cursor
  Check what can be refactored in the current code
  Add filters dropdownu menu
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
		class="mb-4 flex items-center gap-2"
		use:enhance={() => {
			isSearching = true;
			return async ({ update }) => {
				await update();
				isSearching = false;
			};
		}}
	>
		<div class="relative w-full">
			<Input type="search" name="query" placeholder="Search..." class="pl-10" bind:value={query} />
			<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
				<Search class="text-muted-foreground h-5 w-5" />
			</div>
		</div>
		<Button type="submit" disabled={isSearching}>
			{#if isSearching}
				Searching...
			{:else}
				Search
			{/if}
		</Button>
	</form>

	{#if form?.error}
		<p class="text-red-500">{form.error}</p>
	{/if}

	{#if form?.success}
		<h2 class="mb-2 text-xl font-semibold">Results for "{form.query}"</h2>
		<ul class="space-y-2">
			{#each form.results as result}
				<li class="rounded-md border p-4">
					<h3 class="font-bold">{result.title}</h3>
					<p>{result.description}</p>
				</li>
			{/each}
		</ul>
	{/if}
</div>
