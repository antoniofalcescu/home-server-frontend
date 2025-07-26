<script lang="ts" generics="T extends string">
	import * as Select from '$lib/components/ui/select';

	type Option = {
		value: T;
		label: string;
	};

	let {
		label,
		name = label.toLowerCase(),
		options,
		value = $bindable()
	}: {
		label: string;
		name?: string;
		options: Option[];
		value: T;
	} = $props();

	const getLabel = (selectedValue: T) =>
		options.find((option) => option.value === selectedValue)?.label ||
		`Select a ${label.toLowerCase()}`;
</script>

<div class="flex flex-col gap-2">
	<label for="{name}-select" class="text-sm font-medium">{label}</label>
	<Select.Root {name} type="single" bind:value>
		<Select.Trigger class="w-full" id="{name}-select">
			{getLabel(value)}
		</Select.Trigger>
		<Select.Content>
			{#each options as option}
				<Select.Item value={option.value}>{option.label}</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>
</div>
