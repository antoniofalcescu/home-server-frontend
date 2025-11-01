<script lang="ts">
	import { AlertTriangle } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import type { Torrent } from '../types/_server';

	let {
		open = $bindable(),
		torrent,
		onConfirm
	}: {
		open: boolean;
		torrent: Torrent | null;
		onConfirm: () => void;
	} = $props();

	function handleConfirm() {
		onConfirm();
		open = false;
	}
</script>

<!-- TODO: make a similar request approach as in ConvertConfirmationDialog.svelte -->
<Dialog.Root bind:open>
	<Dialog.Content class="max-w-lg">
		<Dialog.Header>
			<Dialog.Title class="text-destructive flex items-center gap-2">
				<AlertTriangle class="h-5 w-5" />
				Delete Torrent
			</Dialog.Title>
			<Dialog.Description>
				This action cannot be undone. The torrent will be permanently removed from your downloads.
			</Dialog.Description>
		</Dialog.Header>

		{#if torrent}
			<div class="py-4">
				<div class="bg-muted flex items-center gap-3 rounded-lg p-3">
					<span class="shrink-0 text-lg">💾</span>
					<div class="min-w-0 flex-1 overflow-hidden">
						<p class="font-medium break-words break-all">{torrent.name}</p>
					</div>
				</div>
			</div>
		{/if}

		<Dialog.Footer class="flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
			<Button variant="outline" onclick={() => (open = false)}>Cancel</Button>
			<Button variant="destructive" onclick={handleConfirm}>Delete Permanently</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
