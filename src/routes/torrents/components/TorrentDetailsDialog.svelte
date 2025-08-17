<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Progress } from '$lib/components/ui/progress';
	import * as Dialog from '$lib/components/ui/dialog';
	import type { Torrent } from '../types';

	export let open: boolean = false;
	export let torrent: Torrent | null = null;

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
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-w-md">
		{#if torrent}
			<Dialog.Header>
				<Dialog.Title>Torrent Details</Dialog.Title>
				<Dialog.Description>
					Detailed information about {torrent.name}
				</Dialog.Description>
			</Dialog.Header>

			<div class="space-y-6 py-6">
				<!-- Torrent Name and Type -->
				<div class="space-y-2">
					<h3 class="text-muted-foreground text-sm font-semibold">Name</h3>
					<p class="text-sm break-words">{torrent.name}</p>
				</div>

				<!-- Status and Progress -->
				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<h3 class="text-muted-foreground text-sm font-semibold">Status</h3>
						<Badge variant={getStatusBadgeVariant(torrent.status)}>
							{torrent.status}
						</Badge>
					</div>
					<div class="space-y-2">
						<h3 class="text-muted-foreground text-sm font-semibold">Type</h3>
						<div class="flex items-center gap-2">
							<span class="text-lg">{getTypeIcon(torrent.type)}</span>
							<span class="text-sm capitalize">{torrent.type}</span>
						</div>
					</div>
				</div>

				<!-- Progress -->
				<div class="space-y-2">
					<h3 class="text-muted-foreground text-sm font-semibold">Progress</h3>
					<div class="flex items-center gap-2">
						<Progress value={torrent.progress} class="h-3 flex-1" />
						<span class="text-sm font-medium">{torrent.progress}%</span>
					</div>
				</div>

				<!-- Size and ETA -->
				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<h3 class="text-muted-foreground text-sm font-semibold">Size</h3>
						<p class="text-sm">{torrent.size}</p>
					</div>
					<div class="space-y-2">
						<h3 class="text-muted-foreground text-sm font-semibold">ETA</h3>
						<p class="text-sm">{torrent.eta}</p>
					</div>
				</div>

				<!-- Speeds -->
				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<h3 class="text-muted-foreground text-sm font-semibold">Download Speed</h3>
						<p class="text-sm">↓ {torrent.downloadSpeed}</p>
					</div>
					<div class="space-y-2">
						<h3 class="text-muted-foreground text-sm font-semibold">Upload Speed</h3>
						<p class="text-sm">↑ {torrent.uploadSpeed}</p>
					</div>
				</div>

				<!-- Peers and Seeds -->
				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<h3 class="text-muted-foreground text-sm font-semibold">Seeds</h3>
						<p class="text-sm">{torrent.seeds}</p>
					</div>
					<div class="space-y-2">
						<h3 class="text-muted-foreground text-sm font-semibold">Peers</h3>
						<p class="text-sm">{torrent.peers}</p>
					</div>
				</div>
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>
