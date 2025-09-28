<script lang="ts">
	interface Props {
		showSystemInfo?: boolean;
		version?: string;
	}

	// Content text constants
	const CONTENT_TEXT = {
		VERSION: "1.0.0",
		COPYRIGHT: '© 2025 Water Quality Monitoring System',
		SEPARATOR: '•',
		BUILT_WITH: 'Built with SvelteKit',
		VERSION_LABEL: 'Version:'
	};

	let { 
		showSystemInfo = true,
		version = CONTENT_TEXT.VERSION
	}: Props = $props();
</script>

<!-- Bottom bar -->
<div class="bg-gray-100 border-t border-gray-200">
	<div class="container mx-auto px-4 py-4">
		<div class="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
			<div class="flex items-center space-x-4 text-sm text-gray-600">
				<span>{CONTENT_TEXT.COPYRIGHT}</span>
				<span class="hidden md:inline">{CONTENT_TEXT.SEPARATOR}</span>
				<span class="hidden md:inline">{CONTENT_TEXT.BUILT_WITH}</span>
			</div>
			
			<!-- Technical info -->
			{#if showSystemInfo}
				<div class="text-xs text-gray-500">
					<p>{CONTENT_TEXT.VERSION_LABEL} {version}</p>
				</div>
			{/if}
		</div>
	</div>
</div>