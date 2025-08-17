<script lang="ts">
	import { RefreshCcw } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import type { PageData } from './$types';
	import type { Torrent, TorrentStats } from './types';

	import { Button } from '$lib/components/ui/button';
	import { TorrentDetailsDialog, TorrentsTable } from './components';

	export let data: PageData & { torrents: Torrent[]; stats: TorrentStats };

	let lastSynced = 0;
	let syncInterval: number;
	let selectedTorrent: Torrent | null = null;
	let dialogOpen = false;

	onMount(() => {
		syncInterval = setInterval(() => {
			lastSynced += 1;
		}, 1000);

		return () => {
			clearInterval(syncInterval);
		};
	});

	async function handleSync() {
		lastSynced = 0;
		await invalidateAll();
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
				<span class="text-muted-foreground text-sm">Last synced {lastSynced} seconds ago</span>
				<Button onclick={handleSync} variant="outline" size="sm">
					<RefreshCcw class="h-4 w-4" />
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
