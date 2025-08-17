<script lang="ts">
	import { Sidebar } from '$lib/components/ui';
	import { House, Settings, Search, Download, ChartLine } from '@lucide/svelte';

	const items = [
		{
			title: 'Home',
			url: '/',
			icon: House
		},
		{
			title: 'Search',
			url: '/search',
			icon: Search
		},
		{
			title: 'Torrents',
			url: '/torrents',
			icon: Download
		},
		{
			title: 'Dashboard',
			url: '/dashboard',
			icon: ChartLine
		},
		{
			title: 'Settings',
			url: '/settings',
			icon: Settings
		}
	];
</script>

<Sidebar.Content class="px-1">
	<Sidebar.Menu class="gap-0.5">
		{#each items as item (item.title)}
			<Sidebar.MenuItem>
				<Sidebar.MenuButton>
					{#snippet child({ props })}
						<a href={item.url} {...props}>
							<item.icon />
							<span>{item.title}</span>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		{/each}
	</Sidebar.Menu>
</Sidebar.Content>
