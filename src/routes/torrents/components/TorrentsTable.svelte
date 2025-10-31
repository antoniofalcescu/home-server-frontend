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
	import { TORRENT_STATUS } from '../constants/_server';
	import {
		getTorrentById,
		getStatusBadgeVariant,
		getTorrentRowClass,
		getTorrentRowStyle,
		getTorrentCellStyle
	} from '../helpers/utils/frontend/torrents-table-utils';

	// TODO: check the existing code and look for ways to refactor it and simplify it
	const {
		torrentsIds,
		torrentById,
		onShowInfo,
		onToggleSuccess,
		onDeleteSuccess,
		onConvertSuccess,
		onConvertError
	}: {
		torrentsIds: string[];
		torrentById: Record<string, Torrent>;
		onShowInfo: (torrent: Torrent) => void;
		onToggleSuccess: (torrent: Torrent) => void;
		onDeleteSuccess: (id: string) => void;
		onConvertSuccess: (message: string) => void;
		onConvertError: (message: string) => void;
	} = $props();

	let deleteDialogOpen = $state(false);
	let convertDialogOpen = $state(false);
	let selectedTorrentForDelete: Torrent | null = $state(null);
	let selectedTorrentForConvert: Torrent | null = $state(null);
	let deletingTorrentIds: Set<string> = $state(new Set<string>());

	// Animation timing constants
	const ANIMATION_DURATION_MS = 400;
	const HIDE_DELAY_MS = 380; // slightly less so hide occurs right after fade completes

	// Track which rows are hidden from the DOM after the fade completes
	let hiddenTorrentIds: Set<string> = $state(new Set<string>());

	// --- Helpers --------------------------------------------------------------

	function rollbackTorrentState(torrentId: string) {
		hiddenTorrentIds.delete(torrentId);
		deletingTorrentIds.delete(torrentId);
	}

	export function animateRowDeletions(ids: string[]) {
		if (!ids || ids.length === 0) {
			return;
		}

		ids.forEach((id) => deletingTorrentIds.add(id));
		setTimeout(() => {
			ids.forEach((id) => hiddenTorrentIds.add(id));
		}, HIDE_DELAY_MS);

		// After animation completes, inform parent to remove rows
		setTimeout(() => {
			ids.forEach((id) => onDeleteSuccess(id));
		}, ANIMATION_DURATION_MS + 20);
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

		animateRowDeletions([selectedTorrentForDelete.id]);

		const formData = new FormData();
		formData.append('torrentId', selectedTorrentForDelete.id);

		try {
			const response = await fetch('?/delete', {
				method: 'POST',
				body: formData
			});

			if (response.ok) {
				await new Promise((resolve) => setTimeout(resolve, ANIMATION_DURATION_MS));
			}
		} catch (error) {
			console.error('Delete failed:', error);
			rollbackTorrentState(selectedTorrentForDelete.id);
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
				{#each torrentsIds as id (id)}
					{@const torrent = getTorrentById(torrentById, id)}
					{#if torrent && !hiddenTorrentIds.has(torrent.id)}
						<Table.Row
							class={getTorrentRowClass(torrent.id, deletingTorrentIds)}
							style={getTorrentRowStyle(torrent.id, deletingTorrentIds)}
						>
							<Table.Cell style={getTorrentCellStyle(torrent.id, deletingTorrentIds)}>
								<span class="text-lg">💾</span>
							</Table.Cell>
							<Table.Cell
								class="max-w-xs"
								style={getTorrentCellStyle(torrent.id, deletingTorrentIds)}
							>
								<div class="truncate font-medium">{torrent.name}</div>
							</Table.Cell>
							<Table.Cell style={getTorrentCellStyle(torrent.id, deletingTorrentIds)}>
								<Badge variant={getStatusBadgeVariant(torrent.status)}>
									{torrent.status}
								</Badge>
							</Table.Cell>
							<Table.Cell class="w-1/3" style={getTorrentCellStyle(torrent.id, deletingTorrentIds)}>
								<div class="flex items-center gap-2">
									<Progress value={torrent.progress} class="h-2 flex-1" />
									<span class="min-w-[3rem] text-sm font-medium">{torrent.progress}%</span>
								</div>
							</Table.Cell>
							<Table.Cell
								class="text-right"
								style={getTorrentCellStyle(torrent.id, deletingTorrentIds)}
							>
								<div class="flex items-center justify-end gap-2">
									<!-- Convert to Jellyfin (Primary CTA - only for completed or seeding torrents) -->
									{#if torrent.status === TORRENT_STATUS.COMPLETED || torrent.status === TORRENT_STATUS.SEEDING}
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
									{#if torrent.status !== TORRENT_STATUS.ERROR}
										<form
											method="POST"
											action="?/toggle"
											use:enhance={({ formData }) => {
												// Derive desired state without a hidden input
												const nextState = torrent.status === 'paused' ? 'play' : 'pause';
												formData.set('state', nextState);

												return async ({ result }) => {
													if (result.type === 'success') {
														const updatedTorrent = result.data!.torrent as Torrent;
														onToggleSuccess(updatedTorrent);
													}
												};
											}}
										>
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
									{/if}

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
					{/if}
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
	onConvertSuccess={(torrentId, message) => {
		animateRowDeletions([torrentId]);
		onConvertSuccess(message);
	}}
	{onConvertError}
/>
