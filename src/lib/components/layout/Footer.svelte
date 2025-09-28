<script lang="ts">
	import BottomBar from './BottomBar.svelte';
	
	interface Props {
		showSystemInfo?: boolean;
		version?: string;
	}

	// Content text constants
	const CONTENT_TEXT = {
		VERSION: "1.0.0",
		SECTION_TITLE: 'About This Tool',
		DESCRIPTION: 'Water Quality Monitoring application processes CSV files to calculate average temperature measurements by monitoring location. Built for environmental data analysis and reporting.'
	};

	let { 
		showSystemInfo = true,
		version = CONTENT_TEXT.VERSION
	}: Props = $props();
</script>

<footer class="bg-gray-50 border-t border-gray-200 mt-auto">
	<!-- Main footer content -->
	<div class="container mx-auto px-4 py-8">
		<!-- About section -->
		<div>
			<h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
				{CONTENT_TEXT.SECTION_TITLE}
			</h3>
			<p class="text-sm text-gray-600 leading-relaxed">
				{CONTENT_TEXT.DESCRIPTION}
			</p>
		</div>
	</div>

	<!-- Use BottomBar component -->
	<BottomBar {showSystemInfo} {version} />
</footer>