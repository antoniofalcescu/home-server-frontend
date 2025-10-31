<script lang="ts">
	import { RefreshCcw } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { invalidate } from '$app/navigation';
	import type { PageData } from './$types';
	import type { Torrent } from './types/_server';

	import { Button } from '$lib/components/ui/button';
	import { Toast } from '$lib/components/layout';
	import { TorrentDetailsDialog, TorrentsTable } from './components';

	const { data }: { data: PageData & { torrents: Torrent[] } } = $props();

	let toastRef: Toast;

	let torrentsIds = $state<string[]>([]);
	let torrentById = $state<Record<string, Torrent>>({});

	function setFromList(list: Torrent[]) {
		torrentsIds = list.map((t) => t.id);
		torrentById = list.reduce((acc, t) => ({ ...acc, [t.id]: t }), {} as Record<string, Torrent>);
	}

	const AUTO_SYNC_INTERVAL_IN_SECONDS = 10;

	let lastSynced = $state(0);
	let selectedTorrent: Torrent | null = $state(null);
	let dialogOpen = $state(false);
	let isSyncing = $state(false);
	let tableRef: { animateRowDeletions: (ids: string[]) => void } | null = null;
	let syncIntervalId: number | null = null;

	function resetSyncInterval() {
		if (syncIntervalId !== null) {
			clearInterval(syncIntervalId);
		}

		syncIntervalId = window.setInterval(() => {
			if (document.visibilityState === 'visible' && !isSyncing) {
				void handleSync();
			}
		}, AUTO_SYNC_INTERVAL_IN_SECONDS * 1000);
	}

	onMount(() => {
		setFromList(data.torrents);

		const counterIntervalId = window.setInterval(() => {
			if (document.visibilityState === 'visible') {
				lastSynced += 1;
			}
		}, 1000);

		resetSyncInterval();

		const onVisibilityChange = () => {
			if (document.visibilityState === 'visible' && !isSyncing) {
				void handleSync();
			}
		};
		document.addEventListener('visibilitychange', onVisibilityChange);

		return () => {
			clearInterval(counterIntervalId);
			if (syncIntervalId !== null) clearInterval(syncIntervalId);
			document.removeEventListener('visibilitychange', onVisibilityChange);
		};
	});

	async function handleSync() {
		if (isSyncing) return;

		isSyncing = true;
		try {
			await invalidate('torrents:list');
			setFromList(data.torrents);

			lastSynced = 0;
			resetSyncInterval();
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

	function handleToggleSuccess(updated: Torrent) {
		if (!torrentById[updated.id]) return;
		torrentById = { ...torrentById, [updated.id]: updated };
	}

	function handleDeleteSuccess(id: string) {
		if (!torrentById[id]) return;
		const { [id]: _omit, ...rest } = torrentById;
		torrentById = rest;
		torrentsIds = torrentsIds.filter((x) => x !== id);
	}

	function handleConvertSuccess(message: string) {
		toastRef?.showToast('success', message);
	}

	function handleConvertError(message: string) {
		toastRef?.showToast('error', message);
	}
</script>

<div class="bg-background p-6">
	<div class="mx-auto max-w-7xl space-y-6">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-foreground text-3xl font-bold">Torrent Manager</h1>
				<p class="text-muted-foreground mt-1">Manage your downloads and media library</p>
			</div>
			<div class="flex items-center gap-4">
				<span class="text-muted-foreground text-sm">
					Last synced {lastSynced} seconds ago
				</span>

				<Button onclick={handleSync} variant="outline" size="sm" disabled={isSyncing}>
					<RefreshCcw class={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
					Sync
				</Button>
			</div>
		</div>

		<TorrentsTable
			bind:this={tableRef}
			{torrentsIds}
			{torrentById}
			onShowInfo={handleShowTorrentInfo}
			onToggleSuccess={handleToggleSuccess}
			onDeleteSuccess={handleDeleteSuccess}
			onConvertSuccess={handleConvertSuccess}
			onConvertError={handleConvertError}
		/>
	</div>
</div>

<TorrentDetailsDialog bind:open={dialogOpen} torrent={selectedTorrent} />

<Toast bind:this={toastRef} />
