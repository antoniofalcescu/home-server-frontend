<script lang="ts">
	import { Button } from '$lib/components/ui/button';

	let { data } = $props();
</script>

{#if data.session}
	<div class="flex h-full w-full items-center justify-center">
		<div class="flex flex-col gap-4">
			<h1 class="text-2xl font-bold">Welcome, {data.session.user.username}!</h1>
			<p>You are logged in.</p>
			<form action="/api/logout" method="POST">
				<Button type="submit" class="w-full">Logout</Button>
			</form>
		</div>
	</div>
{/if}
