<script lang="ts">
	interface Props {
		showSystemInfo?: boolean;
		version?: string;
	}

	// Constants for default values
	const DEFAULT_VALUES = {
		VERSION: "1.0.0"
	};

	let { 
		showSystemInfo = true,
		version = DEFAULT_VALUES.VERSION
	}: Props = $props();

	// Constants for bottom bar content
	const BOTTOM_BAR_CONTENT = {
		COPYRIGHT: '© 2025 Water Quality Monitoring System',
		SEPARATOR: '•',
		BUILT_WITH: 'Built with SvelteKit',
		VERSION_LABEL: 'Version:'
	};
</script>

<!-- Bottom bar -->
<div class="bg-gray-100 border-t border-gray-200">
	<div class="container mx-auto px-4 py-4">
		<div class="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
			<div class="flex items-center space-x-4 text-sm text-gray-600">
				<span>{BOTTOM_BAR_CONTENT.COPYRIGHT}</span>
				<span class="hidden md:inline">{BOTTOM_BAR_CONTENT.SEPARATOR}</span>
				<span class="hidden md:inline">{BOTTOM_BAR_CONTENT.BUILT_WITH}</span>
			</div>
			
			<!-- Technical info -->
			{#if showSystemInfo}
				<div class="text-xs text-gray-500">
					<p>{BOTTOM_BAR_CONTENT.VERSION_LABEL} {version}</p>
				</div>
			{/if}
		</div>
	</div>
</div>