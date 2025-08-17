<script lang="ts">
	import { RefreshCcw } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import type { PageData } from './$types';
	import type { Torrent, TorrentStats } from './types';

	import { Button } from '$lib/components/ui/button';
	import { TorrentDetailsDialog, TorrentsTable } from './components';

	const { data }: { data: PageData & { torrents: Torrent[]; stats: TorrentStats } } = $props();

	const autoSyncInterval = 10;

	let lastSynced = $state(0);
	let selectedTorrent: Torrent | null = $state(null);
	let dialogOpen = $state(false);
	let isSyncing = $state(false);

	onMount(() => {
		const lastSyncCounterInterval = setInterval(() => {
			lastSynced += 1;
		}, 1000);

		const autoSyncTimerInterval = setInterval(() => {
			if (document.visibilityState === 'visible' && !isSyncing) {
				handleSync();
			}
		}, autoSyncInterval * 1000);

		return () => {
			clearInterval(lastSyncCounterInterval);
			clearInterval(autoSyncTimerInterval);
		};
	});

	async function handleSync() {
		if (isSyncing) return;

		isSyncing = true;
		lastSynced = 0;

		try {
			const formData = new FormData();
			const response = await fetch('?/sync', {
				method: 'POST',
				body: formData
			});

			if (response.ok) {
				await invalidateAll();
			}
		} catch (error) {
			console.error('Sync failed:', error);
		} finally {
			isSyncing = false;
		}
	}

	function handleShowTorrentInfo(torrent: Torrent) {
		selectedTorrent = torrent;
		dialogOpen = true;
	}
</script>

<div class="bg-background min-h-screen p-6">
	<div class="mx-auto max-w-7xl space-y-6">
		<!-- Header -->
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-foreground text-3xl font-bold">Torrent Manager</h1>
				<p class="text-muted-foreground mt-1">Manage your downloads and media library</p>
			</div>
			<div class="flex items-center gap-4">
				<!-- Last synced indicator -->
				<span class="text-muted-foreground text-sm">
					Last synced {lastSynced} seconds ago
				</span>

				<!-- Manual sync button -->
				<Button onclick={handleSync} variant="outline" size="sm" disabled={isSyncing}>
					<RefreshCcw class={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
					Sync
				</Button>
			</div>
		</div>

		<!-- Torrents Table -->
		<TorrentsTable torrents={data.torrents} onShowInfo={handleShowTorrentInfo} />
	</div>
</div>

<!-- Torrent Details Dialog -->
<TorrentDetailsDialog bind:open={dialogOpen} torrent={selectedTorrent} />
