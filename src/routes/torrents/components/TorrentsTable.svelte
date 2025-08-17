<script lang="ts">
	import { Info, CirclePlay, CirclePause } from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Progress } from '$lib/components/ui/progress';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import type { Torrent } from '../types';

	export let torrents: Torrent[];
	export let onShowInfo: (torrent: Torrent) => void;

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

	function showTorrentInfo(torrent: Torrent) {
		onShowInfo(torrent);
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
					<Table.Row>
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
							<div class="flex items-center justify-end gap-4">
								<!-- Info Button -->
								<Info onclick={() => showTorrentInfo(torrent)} class="h-6 w-6 cursor-pointer" />

								<!-- Toggle Play/Pause -->
								<form method="POST" action="?/toggle" use:enhance>
									<input type="hidden" name="torrentId" value={torrent.id} />
									<Button variant="outline" size="sm" type="submit">
										{torrent.status === 'paused' ? '▶️' : '⏸️'}
									</Button>
								</form>

								<!-- Convert to Jellyfin (only for completed movies/tv) -->
								{#if (torrent.status === 'completed' || torrent.status === 'seeding') && (torrent.type === 'movie' || torrent.type === 'tv')}
									<form method="POST" action="?/convert" use:enhance>
										<input type="hidden" name="torrentId" value={torrent.id} />
										<Button variant="default" size="sm" type="submit">Convert to Jellyfin</Button>
									</form>
								{/if}

								<!-- Delete -->
								<form method="POST" action="?/delete" use:enhance>
									<input type="hidden" name="torrentId" value={torrent.id} />
									<Button
										variant="outline"
										size="sm"
										type="submit"
										class="text-destructive hover:text-destructive"
									>
										🗑️
									</Button>
								</form>
							</div>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</Card.Content>
</Card.Root>
