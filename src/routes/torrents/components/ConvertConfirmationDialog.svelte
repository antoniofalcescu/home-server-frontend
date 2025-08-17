<script lang="ts">
	import { Monitor, Trash2 } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Checkbox from '$lib/components/ui/checkbox';
	import type { Torrent } from '../types';

	let {
		open = $bindable(),
		torrent,
		onConfirm
	}: {
		open: boolean;
		torrent: Torrent | null;
		onConfirm: (deleteAfterConvert: boolean) => void;
	} = $props();

	let deleteAfterConvert = $state(false);

	function handleConfirm() {
		onConfirm(deleteAfterConvert);
		open = false;
		deleteAfterConvert = false; // Reset for next time
	}

	function handleCancel() {
		open = false;
		deleteAfterConvert = false; // Reset for next time
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-w-lg">
		<Dialog.Header>
			<Dialog.Title class="text-primary flex items-center gap-2">
				<Monitor class="h-5 w-5" />
				Convert to Jellyfin
			</Dialog.Title>
			<Dialog.Description>
				This will convert the torrent to a format compatible with your Jellyfin media server.
			</Dialog.Description>
		</Dialog.Header>

		{#if torrent}
			<div class="space-y-4 py-4">
				<!-- Torrent Info -->
				<div class="bg-muted flex items-center gap-3 rounded-lg p-3">
					<span class="text-lg">
						{torrent.type === 'movie' ? '🎬' : torrent.type === 'tv' ? '📺' : '💾'}
					</span>
					<div class="min-w-0 flex-1">
						<p class="font-medium break-words">{torrent.name}</p>
					</div>
				</div>

				<!-- Delete Option -->
				<div class="flex items-start gap-3 rounded-lg border p-3">
					<Checkbox.Root id="deleteAfterConvert" bind:checked={deleteAfterConvert} class="mt-0.5" />
					<div class="flex-1">
						<label
							for="deleteAfterConvert"
							class="flex cursor-pointer items-center gap-2 font-medium"
						>
							<Trash2 class="text-muted-foreground h-4 w-4" />
							Delete torrent after conversion
						</label>
						<p class="text-muted-foreground mt-1 text-sm">
							Remove the original torrent file from downloads after successful conversion.
						</p>
					</div>
				</div>
			</div>
		{/if}

		<Dialog.Footer class="flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
			<Button variant="outline" onclick={handleCancel}>Cancel</Button>
			<Button variant="default" onclick={handleConfirm}>
				<Monitor class="mr-2 h-4 w-4" />
				Convert to Jellyfin
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
