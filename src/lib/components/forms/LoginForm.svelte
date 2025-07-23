<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { enhance } from '$app/forms';
	import type { ActionData } from '../../../routes/login/$types';

	let { form }: { form: ActionData } = $props();
</script>

<Card.Root class="w-full max-w-md">
	<form method="POST" action="?/login" use:enhance>
		<Card.Header>
			<Card.Title>Log in</Card.Title>
			<Card.Description>Enter your credentials to continue</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="flex flex-col gap-6">
				<div class="grid gap-2">
					<Label for="email">Email</Label>
					<Input name="email" id="email" type="email" placeholder="email@example.com" required />
				</div>
				<div class="grid gap-2">
					<Label for="password">Password</Label>
					<Input name="password" id="password" type="password" required />
				</div>
				{#if form?.error}
					<p class="text-sm text-red-500">{form.error}</p>
				{/if}
			</div>
		</Card.Content>
		<Card.Footer class="mt-4 flex-col">
			<Button type="submit" class="w-full">Login</Button>
		</Card.Footer>
	</form>
</Card.Root>
