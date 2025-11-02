<script lang="ts">
	import { Monitor } from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Select from '$lib/components/ui/select';
	import type { Torrent } from '../types/_server';

	type TorrentType = 'movie' | 'tvShow';

	// TODO: create a single source of truth place for these kind of constants
	const ANIMATION_DURATION_MS = 400;

	let {
		open = $bindable(),
		torrent,
		onConvertSuccess,
		onConvertError
	}: {
		open: boolean;
		torrent: Torrent | null;
		onConvertSuccess: (
			torrentId: string,
			message: string,
			toastType: 'success' | 'warning'
		) => void;
		onConvertError: (message: string) => void;
	} = $props();

	let selectedType = $state<TorrentType | undefined>(undefined);
	let showValidation = $state(false);

	function resetState() {
		open = false;
		selectedType = undefined;
		showValidation = false;
	}

	function handleOpenChange(isOpen: boolean) {
		open = isOpen;
		if (!isOpen) {
			resetState();
		}
	}

	function handleCancel() {
		resetState();
	}

	function getTypeLabel(type: TorrentType | undefined): string {
		if (type === 'movie') return 'Movie';
		if (type === 'tvShow') return 'TV Show';
		return 'Select the type of the torrent';
	}

	function validateForm(): boolean {
		if (!selectedType) {
			showValidation = true;
			return false;
		}

		return true;
	}

	async function handleSuccess(torrentId: string, parsingSucceeded: boolean) {
		resetState();
		const message = parsingSucceeded
			? 'Torrent successfully converted'
			: 'Conversion successful. Name parsing failed - please rename manually in Media page.';
		const toastType: 'success' | 'warning' = parsingSucceeded ? 'success' : 'warning';
		onConvertSuccess(torrentId, message, toastType);
		await new Promise((resolve) => setTimeout(resolve, ANIMATION_DURATION_MS));
	}

	function handleFailure(message: string) {
		resetState();
		onConvertError(message);
	}

	function getErrorMessage(result: { data?: unknown }): string {
		const data = result.data as { message?: string } | undefined;
		return data?.message || 'Failed to convert torrent';
	}
</script>

<Dialog.Root {open} onOpenChange={handleOpenChange}>
	<Dialog.Content class="max-w-lg overflow-hidden">
		<form
			method="POST"
			action="?/convert"
			class="contents"
			use:enhance={({ formData }) => {
				if (!torrent || !validateForm()) {
					return;
				}

				formData.set('torrentId', torrent.id);
				formData.set('type', selectedType!);

				return async ({ result, update }) => {
					if (result.type === 'success') {
						const { parsingSucceeded } = result.data as {
							parsingSucceeded: boolean;
						};
						await update();
						await handleSuccess(torrent.id, parsingSucceeded);
					} else if (result.type === 'failure') {
						handleFailure(getErrorMessage(result));
					} else {
						handleFailure('Failed to convert torrent');
					}
				};
			}}
		>
			<input type="hidden" name="torrentId" value={torrent?.id} />
			<input type="hidden" name="type" value={selectedType} />

			<Dialog.Header>
				<Dialog.Title class="text-primary flex items-center gap-2">
					<Monitor class="h-5 w-5" />
					Convert to Jellyfin
				</Dialog.Title>
				<Dialog.Description>
					This will convert the torrent to a format compatible with your Jellyfin media server. The
					torrent will be automatically removed after successful conversion.
				</Dialog.Description>
			</Dialog.Header>

			<div class="space-y-4 py-4">
				<!-- Torrent Info -->
				<div class="bg-muted flex items-start gap-3 rounded-lg p-3">
					<span class="shrink-0 text-lg">💾</span>
					<div class="min-w-0 flex-1 overflow-hidden">
						<p class="font-medium break-words break-all">{torrent?.name}</p>
					</div>
				</div>

				<!-- Torrent Type Selection -->
				<div class="space-y-2">
					<label for="torrentType" class="text-sm font-medium"
						>Content Type <span class="text-destructive">*</span></label
					>
					<Select.Root type="single" bind:value={selectedType}>
						<Select.Trigger
							id="torrentType"
							class="w-full {showValidation && !selectedType ? 'border-destructive' : ''}"
						>
							{getTypeLabel(selectedType)}
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="movie">Movie</Select.Item>
							<Select.Item value="tvShow">TV Show</Select.Item>
						</Select.Content>
					</Select.Root>
					{#if showValidation && !selectedType}
						<p class="text-destructive text-xs">Please select a content type to continue</p>
					{/if}
				</div>
			</div>

			<Dialog.Footer class="flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
				<Button type="button" variant="outline" onclick={handleCancel}>Cancel</Button>
				<Button type="submit" variant="default" disabled={showValidation && !selectedType}>
					<Monitor class="mr-2 h-4 w-4" />
					Convert to Jellyfin
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
