<script lang="ts">
	import FileUpload from '$lib/components/FileUpload.svelte';
	import ResultsDisplay from '$lib/components/ResultsDisplay.svelte';
	import PageLayout from '$lib/components/layout/PageLayout.svelte';
	import type { TemperatureData } from '$lib/types';

	// Constants for page content
	const PAGE_MESSAGES = {
		TITLE: 'Water Quality Monitoring',
		DESCRIPTION: 'Process water quality CSV files and calculate temperature averages by monitoring location',
		SUBTITLE: 'Upload CSV files to calculate average water temperature by monitoring location. Perfect for environmental data analysis and reporting.',
		PROCESSING_ERROR_TITLE: 'Processing Error'
	};
	
	let results = $state<TemperatureData | null>(null);
	let error = $state<string | null>(null);

	/**
	 * Handles successful CSV file processing
	 * @param data - Temperature data with location IDs as keys and average temperatures as values
	 */
	function handleFileProcessed(data: TemperatureData) {
		results = data;
		error = null;
	}

	/**
	 * Handles the start of file processing
	 * Resets state for new processing
	 */
	function handleProcessingStart() {
		error = null;
		results = null;
	}

	/**
	 * Handles processing errors
	 * @param errorMessage - Error message to display to user
	 */
	function handleError(errorMessage: string) {
		error = errorMessage;
		results = null;
	}
</script>

<svelte:head>
	<title>{PAGE_MESSAGES.TITLE}</title>
	<meta name="description" content="{PAGE_MESSAGES.DESCRIPTION}" />
</svelte:head>

<PageLayout 
	title={PAGE_MESSAGES.TITLE}
	subtitle={PAGE_MESSAGES.SUBTITLE}
	maxWidth="xl"
>
	{#snippet children()}
		<!-- Upload Section -->
		<div class="max-w-4xl mx-auto">
			<FileUpload 
				onfileprocessed={handleFileProcessed}
				onprocessingstart={handleProcessingStart}
				onerror={handleError}
			/>

			<!-- Error Display -->
			{#if error}
				<div class="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
								<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
							</svg>
						</div>
						<div class="ml-3">
							<h3 class="text-sm font-medium text-red-800">{PAGE_MESSAGES.PROCESSING_ERROR_TITLE}</h3>
							<p class="text-sm text-red-700 mt-1">{error}</p>
						</div>
					</div>
				</div>
			{/if}

			<!-- Results Section -->
			{#if results}
				<ResultsDisplay {results} />
			{/if}
		</div>
	{/snippet}
</PageLayout>