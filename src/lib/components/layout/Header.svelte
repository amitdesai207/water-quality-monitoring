<script lang="ts">
	import Logo from './Logo.svelte';

	interface Props {
		title?: string;
		subtitle?: string;
		showLogo?: boolean;
	}

	// Content text constants
	const CONTENT_TEXT = {
		TITLE: "Water Quality Monitoring",
		SUBTITLE: "Upload CSV files to calculate average water temperature by monitoring location."
	};

	let { 
		title = CONTENT_TEXT.TITLE,
		subtitle = CONTENT_TEXT.SUBTITLE,
		showLogo = true
	}: Props = $props();
</script>

<header class="custom-bg shadow-sm border-b border-gray-200">
	<div class="container mx-auto px-4 py-6">
		<!-- Top section with logo -->
		{#if showLogo}
		<div class="flex justify-between items-center mb-6">
			<!-- Use logo component -->
			<Logo size="md" />
		</div>
		{/if}

		<!-- Page title and description -->
		<div class="text-center">
			<h1 class="text-4xl font-bold text-white mb-4">
				{title}
			</h1>
			{#if subtitle}
				<p class="text-xl text-gray-200 max-w-2xl mx-auto">
					{subtitle}
				</p>
			{/if}
		</div>
	</div>
</header>
