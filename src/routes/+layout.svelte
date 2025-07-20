<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { AppSidebar, Footer } from '$lib/components/layout';
	import { Sidebar } from '$lib/components/ui';

	let { children, data } = $props();
</script>

<ModeWatcher />
<Sidebar.Provider open={false}>
	{#if data.session}
		<AppSidebar user={data.session.user} />
	{/if}
	<div class="relative flex min-h-screen w-full flex-col">
		{#if data.session}
			<Sidebar.Trigger />
		{/if}
		{@render children()}
		<Footer />
	</div>
</Sidebar.Provider>
