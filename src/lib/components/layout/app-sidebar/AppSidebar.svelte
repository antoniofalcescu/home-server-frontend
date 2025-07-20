<script lang="ts">
	import { Sidebar } from '$lib/components/ui';
	import SidebarHeader from './AppSidebarHeader.svelte';
	import SidebarContent from './AppSidebarContent.svelte';
	import SidebarFooter from './AppSidebarFooter.svelte';

	let { user } = $props();
</script>

<Sidebar.Root>
	<SidebarHeader />
	<SidebarContent />
	<SidebarFooter {user} />
</Sidebar.Root>
