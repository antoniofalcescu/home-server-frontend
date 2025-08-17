<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { Sidebar, DropdownMenu } from '$lib/components/ui';
	import { ChevronUp, User } from '@lucide/svelte';

	let { user } = $props();

	async function handleLogout() {
		await fetch('/api/logout', { method: 'POST' });
		await invalidateAll();
	}
</script>

<Sidebar.Footer class="py-2">
	<Sidebar.Menu>
		<Sidebar.MenuItem>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
						<Sidebar.MenuButton
							{...props}
							class="group data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground h-full cursor-pointer"
						>
							<div class="flex w-full items-center gap-3">
								{#if user.image}
									<img src={user.image} alt={`User's image`} class="h-12 w-12 rounded-full" />
								{:else}
									<User class="bg-muted/50 h-12 w-12 rounded-full p-3" />
								{/if}
								<div class="flex flex-col items-start text-left">
									<span class="font-bold">{user.username}</span>
									<span class="text-muted-foreground text-sm">{user.role} Account</span>
								</div>
								<ChevronUp
									class="ml-auto transition-transform group-data-[state=open]:rotate-180"
								/>
							</div>
						</Sidebar.MenuButton>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content
					side="top"
					align="end"
					class="w-[var(--radix-dropdown-menu-trigger-width)]"
				>
					<DropdownMenu.Item class="cursor-pointer">
						<span>Account</span>
					</DropdownMenu.Item>
					<DropdownMenu.Item onclick={handleLogout} class="cursor-pointer">
						<span>Log out</span>
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</Sidebar.MenuItem>
	</Sidebar.Menu>
</Sidebar.Footer>
