<script lang="ts">
	import BottomBar from './BottomBar.svelte';
	
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

	// Constants for footer content
	const FOOTER_CONTENT = {
		SECTION_TITLE: 'About This Tool',
		DESCRIPTION: 'Water Quality Monitoring application processes CSV files to calculate average temperature measurements by monitoring location. Built for environmental data analysis and reporting.'
	};
</script>

<footer class="bg-gray-50 border-t border-gray-200 mt-auto">
	<!-- Main footer content -->
	<div class="container mx-auto px-4 py-8">
		<!-- About section -->
		<div>
			<h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
				{FOOTER_CONTENT.SECTION_TITLE}
			</h3>
			<p class="text-sm text-gray-600 leading-relaxed">
				{FOOTER_CONTENT.DESCRIPTION}
			</p>
		</div>
	</div>

	<!-- Use BottomBar component -->
	<BottomBar {showSystemInfo} {version} />
</footer>