<script lang="ts">
	import { AlertTriangle } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Badge } from '$lib/components/ui/badge';
	import type { Torrent } from '../types';

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
					<span class="text-lg">
						{torrent.type === 'movie' ? '🎬' : torrent.type === 'tv' ? '📺' : '💾'}
					</span>
					<div class="min-w-0 flex-1">
						<p class="font-medium break-words">{torrent.name}</p>
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
