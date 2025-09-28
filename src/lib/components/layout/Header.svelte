<script lang="ts">
	import Logo from './Logo.svelte';

	interface Props {
		title?: string;
		subtitle?: string;
		showLogo?: boolean;
	}

	// Constants for default values
	const DEFAULT_VALUES = {
		TITLE: "Water Quality Monitoring",
		SUBTITLE: "Upload CSV files to calculate average water temperature by monitoring location."
	};

	let { 
		title = DEFAULT_VALUES.TITLE,
		subtitle = DEFAULT_VALUES.SUBTITLE,
		showLogo = true
	}: Props = $props();
</script>

<header class="bg-white shadow-sm border-b border-gray-200">
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
			<h1 class="text-4xl font-bold text-gray-900 mb-4">
				{title}
			</h1>
			{#if subtitle}
				<p class="text-xl text-gray-600 max-w-2xl mx-auto">
					{subtitle}
				</p>
			{/if}
		</div>
	</div>
</header>
