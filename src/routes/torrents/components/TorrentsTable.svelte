<script lang="ts">
	import { Info, Play, Pause, Trash2, Monitor } from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Progress } from '$lib/components/ui/progress';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { DeleteConfirmationDialog, ConvertConfirmationDialog } from './index';
	import type { Torrent } from '../types/_server';

	// TODO: check the existing code and look for ways to refactor it and simplify it
	const { torrents, onShowInfo }: { torrents: Torrent[]; onShowInfo: (torrent: Torrent) => void } =
		$props();

	let deleteDialogOpen = $state(false);
	let convertDialogOpen = $state(false);
	let selectedTorrentForDelete: Torrent | null = $state(null);
	let selectedTorrentForConvert: Torrent | null = $state(null);
	let deletingTorrentId: string | null = $state(null);

	function getStatusBadgeVariant(status: Torrent['status']) {
		switch (status) {
			case 'downloading':
				return 'default';
			case 'seeding':
				return 'secondary';
			case 'completed':
				return 'secondary';
			case 'paused':
				return 'outline';
			case 'error':
				return 'destructive';
			default:
				return 'outline';
		}
	}

	function getTypeIcon(type: Torrent['type']) {
		switch (type) {
			case 'movie':
				return '🎬';
			case 'tv':
				return '📺';
			default:
				return '💾';
		}
	}

	function handleDeleteClick(torrent: Torrent) {
		selectedTorrentForDelete = torrent;
		deleteDialogOpen = true;
	}

	function handleConvertClick(torrent: Torrent) {
		selectedTorrentForConvert = torrent;
		convertDialogOpen = true;
	}

	async function handleDeleteConfirm() {
		if (!selectedTorrentForDelete) return;

		// Start deletion animation
		deletingTorrentId = selectedTorrentForDelete.id;

		// Submit the delete form immediately
		const formData = new FormData();
		formData.append('torrentId', selectedTorrentForDelete.id);

		try {
			const response = await fetch('?/delete', {
				method: 'POST',
				body: formData
			});

			if (response.ok) {
				// Wait for animation to complete, then refresh
				await new Promise((resolve) => setTimeout(resolve, 400));
				await invalidateAll(); // Refresh to update the data
			}
		} catch (error) {
			console.error('Delete failed:', error);
			deletingTorrentId = null; // Reset animation state on error
		}
	}

	async function handleConvertConfirm(deleteAfterConvert: boolean) {
		if (!selectedTorrentForConvert) return;

		const formData = new FormData();
		formData.append('torrentId', selectedTorrentForConvert.id);
		formData.append('deleteAfterConvert', deleteAfterConvert.toString());

		try {
			const response = await fetch('?/convert', {
				method: 'POST',
				body: formData
			});

			if (response.ok) {
				if (deleteAfterConvert) {
					// Start deletion animation if deleting after convert
					deletingTorrentId = selectedTorrentForConvert.id;
					await new Promise((resolve) => setTimeout(resolve, 400));
				}
				await invalidateAll(); // Refresh to update the data
			}
		} catch (error) {
			console.error('Convert failed:', error);
		}
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Active Torrents</Card.Title>
	</Card.Header>
	<Card.Content class="p-0">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head class="w-12"></Table.Head>
					<Table.Head>Name</Table.Head>
					<Table.Head>Status</Table.Head>
					<Table.Head class="w-1/3">Progress</Table.Head>
					<Table.Head class="text-right">Actions</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each torrents as torrent (torrent.id)}
					<Table.Row
						class="transition-all duration-400 ease-out {deletingTorrentId === torrent.id
							? 'h-0 translate-x-6 scale-90 overflow-hidden opacity-0'
							: 'h-auto translate-x-0 scale-100 opacity-100'}"
					>
						<Table.Cell>
							<span class="text-lg">{getTypeIcon(torrent.type)}</span>
						</Table.Cell>
						<Table.Cell class="max-w-xs">
							<div class="truncate font-medium">{torrent.name}</div>
						</Table.Cell>
						<Table.Cell>
							<Badge variant={getStatusBadgeVariant(torrent.status)}>
								{torrent.status}
							</Badge>
						</Table.Cell>
						<Table.Cell class="w-1/3">
							<div class="flex items-center gap-2">
								<Progress value={torrent.progress} class="h-2 flex-1" />
								<span class="min-w-[3rem] text-sm font-medium">{torrent.progress}%</span>
							</div>
						</Table.Cell>
						<Table.Cell class="text-right">
							<div class="flex items-center justify-end gap-2">
								<!-- Convert to Jellyfin (Primary CTA - only for completed movies/tv) -->
								{#if (torrent.status === 'completed' || torrent.status === 'seeding') && (torrent.type === 'movie' || torrent.type === 'tv')}
									<Button
										variant="default"
										size="icon"
										onclick={() => handleConvertClick(torrent)}
										class="h-8 w-8"
										title="Convert to Jellyfin"
									>
										<Monitor class="h-4 w-4" />
									</Button>
								{/if}

								<!-- Toggle Play/Pause -->
								<form method="POST" action="?/toggle" use:enhance>
									<input type="hidden" name="torrentId" value={torrent.id} />
									<Button
										variant="ghost"
										size="icon"
										type="submit"
										class="h-8 w-8"
										title={torrent.status === 'paused' ? 'Resume torrent' : 'Pause torrent'}
									>
										{#if torrent.status === 'paused'}
											<Play class="h-4 w-4" />
										{:else}
											<Pause class="h-4 w-4" />
										{/if}
									</Button>
								</form>

								<!-- Info Button -->
								<Button
									variant="ghost"
									size="icon"
									onclick={() => onShowInfo(torrent)}
									class="h-8 w-8"
									title="View torrent details"
								>
									<Info class="h-4 w-4" />
								</Button>

								<!-- Delete -->
								<Button
									variant="ghost"
									size="icon"
									onclick={() => handleDeleteClick(torrent)}
									class="text-destructive hover:text-destructive h-8 w-8"
									title="Delete torrent"
								>
									<Trash2 class="h-4 w-4" />
								</Button>
							</div>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</Card.Content>
</Card.Root>

<!-- Confirmation Dialogs -->
<DeleteConfirmationDialog
	bind:open={deleteDialogOpen}
	torrent={selectedTorrentForDelete}
	onConfirm={handleDeleteConfirm}
/>

<ConvertConfirmationDialog
	bind:open={convertDialogOpen}
	torrent={selectedTorrentForConvert}
	onConfirm={handleConvertConfirm}
/>
