<script lang="ts">
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { CheckCircle, XCircle } from 'lucide-svelte';
	import { fade, fly } from 'svelte/transition';

	interface Toast {
		id: string;
		type: 'success' | 'error';
		message: string;
	}

	// Props
	let { duration = 3000 } = $props();

	// Simple state - just an array of toasts
	let toasts = $state<Toast[]>([]);

	// Main function: show a toast
	export function showToast(type: 'success' | 'error', message: string) {
		const id = Date.now().toString(); // Simple ID generation

		const toast: Toast = { id, type, message };
		toasts.push(toast);

		// Auto-remove after duration
		setTimeout(() => {
			toasts = toasts.filter((t) => t.id !== id);
		}, duration);
	}

	// Simple dismiss function
	export function dismissToast(id: string) {
		toasts = toasts.filter((t) => t.id !== id);
	}
</script>

<!-- Simple rendering with built-in Svelte transitions -->
<div class="fixed right-4 bottom-4 z-50 flex flex-col-reverse gap-2">
	{#each toasts as toast (toast.id)}
		<div in:fly={{ y: 50, duration: 300 }} out:fade={{ duration: 400 }}>
			<Alert
				variant={toast.type === 'error' ? 'destructive' : 'default'}
				class="max-w-sm min-w-80 cursor-pointer shadow-lg {toast.type === 'success'
					? 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200'
					: ''}"
				onclick={() => dismissToast(toast.id)}
			>
				{#snippet children()}
					{#if toast.type === 'success'}
						<CheckCircle class="h-4 w-4 text-green-600 dark:text-green-400" />
					{:else}
						<XCircle class="h-4 w-4" />
					{/if}
					<AlertDescription>
						{toast.message}
					</AlertDescription>
				{/snippet}
			</Alert>
		</div>
	{/each}
</div>
