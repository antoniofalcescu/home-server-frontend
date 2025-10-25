<script lang="ts">
	import { RefreshCcw } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import type { PageData } from './$types';
	import type { Torrent } from './types/_server';

	import { Button } from '$lib/components/ui/button';
	import { TorrentDetailsDialog, TorrentsTable } from './components';

	const { data }: { data: PageData & { torrents: Torrent[] } } = $props();

	// Normalized torrents for efficient per-row updates
	let torrentsIds = $state<string[]>([]);
	let torrentById = $state<Record<string, Torrent>>({});

	function setFromList(list: Torrent[]) {
		torrentsIds = list.map((t) => t.id);
		const next: Record<string, Torrent> = {};
		for (const t of list) next[t.id] = t;
		torrentById = next;
	}

	const AUTO_SYNC_INTERVAL_IN_SECONDS = 100000;

	let lastSynced = $state(0);
	let selectedTorrent: Torrent | null = $state(null);
	let dialogOpen = $state(false);
	let isSyncing = $state(false);
	let tableRef: { animateRowDeletions: (ids: string[]) => void } | null = null;
	let currentIds = new Set<string>(data.torrents.map((t) => t.id));
	let tickerIntervalId: number | null = null;
	let nextSyncAt = $state(Date.now() + AUTO_SYNC_INTERVAL_IN_SECONDS * 1000);

	onMount(() => {
		// Initialize normalized state on first mount
		setFromList(data.torrents);
		function shouldSync() {
			return document.visibilityState === 'visible' && !isSyncing && Date.now() >= nextSyncAt;
		}

		function tick() {
			if (document.visibilityState === 'visible') {
				lastSynced += 1;
			}
			if (shouldSync()) {
				void handleSync();
			}
		}

		tickerIntervalId = window.setInterval(tick, 1000);

		const onVisibilityChange = () => {
			if (shouldSync()) {
				void handleSync();
			}
		};
		document.addEventListener('visibilitychange', onVisibilityChange);

		return () => {
			if (tickerIntervalId !== null) clearInterval(tickerIntervalId);
			document.removeEventListener('visibilitychange', onVisibilityChange);
		};
	});

	async function handleSync() {
		if (isSyncing) return;

		isSyncing = true;
		try {
			const response = await fetch('?/sync', {
				method: 'POST',
				body: new FormData()
			});

			if (response.ok) {
				// Prefer using action payload if present to update immediately
				let usedPayload = false;
				try {
					const payload = (await response.json()) as { torrents?: Torrent[] };
					if (payload?.torrents) {
						setFromList(payload.torrents);
						usedPayload = true;
					}
				} catch {}

				if (!usedPayload) {
					await invalidateAll();
					setFromList(data.torrents);
				}

				// Fresh data received -> reset counter and next schedule
				lastSynced = 0;
				nextSyncAt = Date.now() + AUTO_SYNC_INTERVAL_IN_SECONDS * 1000;
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

	function handleToggleSuccess(updated: Torrent) {
		if (!torrentById[updated.id]) return;
		torrentById = { ...torrentById, [updated.id]: updated };
	}

	function handleDeleteSuccess(id: string) {
		if (!torrentById[id]) return;
		// Remove from byId and ids without a global reload
		const { [id]: _omit, ...rest } = torrentById;
		torrentById = rest;
		torrentsIds = torrentsIds.filter((x) => x !== id);
	}
</script>

<div class="bg-background min-h-screen p-6">
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
		/>
	</div>
</div>

<TorrentDetailsDialog bind:open={dialogOpen} torrent={selectedTorrent} />
