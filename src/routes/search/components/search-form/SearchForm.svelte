<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { enhance } from '$app/forms';
	import { ChevronDown, Search } from 'lucide-svelte';
	import { SelectButton } from '$lib/components/buttons';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import type { Props } from './types';
	import { CATEGORIES, SORT_OPTIONS } from './constants';

	let { searchState = $bindable(), onSearchEnhance, onClearFilters }: Props = $props();

	// Component-level UI state
	let showFilters = $state(false);
</script>

<form method="POST" action="?/search" class="mb-4" use:enhance={onSearchEnhance}>
	<div class="flex items-start gap-2">
		<div class="relative w-full">
			<Input
				type="search"
				name="query"
				placeholder="Search..."
				class="pl-10"
				bind:value={searchState.query}
			/>
			<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
				<Search class="text-muted-foreground h-5 w-5" />
			</div>
		</div>

		<Button
			type="submit"
			disabled={searchState.isSearching}
			class={searchState.isSearching ? 'cursor-progress' : 'cursor-pointer'}
		>
			{searchState.isSearching ? 'Searching...' : 'Search'}
		</Button>

		<DropdownMenu.Root bind:open={showFilters}>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Button {...props} type="button" variant="outline" class="group flex items-center gap-2">
						Filters
						<ChevronDown
							class="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180"
						/>
					</Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content class="w-64" align="end">
				<div class="flex flex-col gap-4 p-4">
					<SelectButton
						label="Category"
						options={CATEGORIES}
						bind:value={searchState.selectedCategory}
					/>
					<SelectButton
						label="Sort by"
						options={SORT_OPTIONS}
						bind:value={searchState.selectedSort}
					/>
					<div class="-mx-4 my-2 border-t"></div>
					<Button type="button" variant="ghost" class="w-full" size="sm" onclick={onClearFilters}>
						Clear Filters
					</Button>
				</div>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
</form>
