<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { setupGlobalErrorHandlers } from '$lib/utils/error-handler';
	
	let { children } = $props();

	// Initialize global error handling
	onMount(() => {
		setupGlobalErrorHandlers();
	});
</script>

<svelte:head>
	<link rel="icon" href="/favicon.svg" />
</svelte:head>

{@render children?.()}
