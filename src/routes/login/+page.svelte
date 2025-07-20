<script lang="ts">
	import { LoginForm } from '$lib/components/forms';
	import { ThemeToggle } from '$lib/components/toggles';

	export let form;
</script>

<div class="flex w-full flex-col">
	<!-- Header -->
	<div class="flex w-full items-center justify-between p-4">
		<div class="flex items-center gap-2">
			<img src="/home_server_logo.png" alt="Home Server" class="h-24 w-24" />
			<h1 class="text-2xl font-bold">Home Server</h1>
		</div>
		<ThemeToggle />
	</div>
	<!-- Main content -->
	<div class="flex w-full flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
		<h1 class="text-2xl font-bold">Welcome</h1>
		<p class="text-muted-foreground">Log in to access your home server</p>
		<LoginForm {form} />
	</div>
</div>
