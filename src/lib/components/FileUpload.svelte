<script lang="ts">
	import type { FileUploadProps } from '$lib/types';

	let { 
		onfileprocessed = () => {}, 
		onprocessingstart = () => {}, 
		onerror = () => {} 
	}: FileUploadProps = $props();

	let fileInput = $state<HTMLInputElement>();
	let selectedFile = $state<File | null>(null);
	let isProcessing = $state(false);

	// Constants for messages and validation
	const MESSAGES = {
		INVALID_FILE_TYPE: 'Please select a CSV file.',
		FILE_TOO_LARGE: 'File size must be less than 10MB.',
		PROCESSING_FAILED: 'Failed to process file',
		UNKNOWN_ERROR: 'Unknown error occurred',
		PROCESSING_STATUS: 'Processing CSV file...',
		FILE_SELECTED: 'File Selected',
		SELECT_CSV_FILE: 'Select CSV File',
		CLICK_TO_BROWSE: 'Click here to browse and select your CSV file',
		FILE_SUPPORT_INFO: 'Supports files up to 10MB • CSV format only',
		PROCESSING_BUTTON: 'Processing...',
		PROCESS_FILE_BUTTON: 'Process File',
		CLEAR_BUTTON: 'Clear',
		DROP_FILE_HERE: 'Drop your CSV file here',
		EXPECTED_FORMAT: 'Expected CSV Format:',
		MONITORING_LOCATION_DESC: 'MonitoringLocationID: Unique identifier for each monitoring site',
		CHARACTERISTIC_NAME_DESC: 'CharacteristicName: Must include "Temperature, water" entries',
		RESULT_VALUE_DESC: 'ResultValue: Numeric temperature values',
		CALCULATION_INFO: 'The application will calculate the average temperature for each monitoring location where the characteristic is "Temperature, water".'
	};

	const VALIDATION = {
		MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
		ALLOWED_EXTENSION: '.csv'
	};

	/**
	 * Validates a file for type and size requirements
	 * @param file - File object to validate
	 * @returns Object with isValid boolean and error message if invalid
	 */
	function validateFile(file: File): { isValid: boolean; error?: string } {
		// Check file extension
		if (!file.name.toLowerCase().endsWith(VALIDATION.ALLOWED_EXTENSION)) {
			return { isValid: false, error: MESSAGES.INVALID_FILE_TYPE };
		}

		// Check file size

		if (file.size > VALIDATION.MAX_FILE_SIZE) {
			return { isValid: false, error: MESSAGES.FILE_TOO_LARGE };
		}

		return { isValid: true };
	}

	/**
	 * Handles file input change events from file picker
	 * Processes selected files from file input
	 * @param event - Input change event from file input element
	 */
	function handleFileInputChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const files = target.files;
		if (files && files.length > 0) {
			handleFileSelection(files[0]);
		}
	}

	/**
	 * Validates and processes a selected file
	 * Uses consolidated validation function
	 * @param file - File object to validate and process
	 */
	function handleFileSelection(file: File) {
		const validation = validateFile(file);
		
		if (!validation.isValid) {
			onerror(validation.error!);
			return;
		}

		selectedFile = file;
	}

	/**
	 * Processes the selected CSV file by sending it to the API
	 * Handles the complete upload and processing workflow
	 * @returns Promise that resolves when processing is complete
	 */
	async function processFile() {
		if (!selectedFile) return;

		isProcessing = true;
		onprocessingstart();

		try {
			const formData = new FormData();
			formData.append('csvFile', selectedFile);

			const response = await fetch('/api/process-csv', {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || MESSAGES.PROCESSING_FAILED);
			}

			const results = await response.json();
			onfileprocessed(results);
			
			// Reset form
			selectedFile = null;
			if (fileInput) fileInput.value = '';

		} catch (error) {
			onerror(error instanceof Error ? error.message : MESSAGES.UNKNOWN_ERROR);
		} finally {
			isProcessing = false;
		}
	}

	/**
	 * Clears the currently selected file
	 * Resets both component state and file input value
	 */
	function clearFile() {
		selectedFile = null;
		if (fileInput) fileInput.value = '';
	}

	/**
	 * Triggers the file input element
	 * Opens the file picker dialog
	 */
	function triggerFileInput() {
		if (!isProcessing) {
			fileInput?.click();
		}
	}
</script>

<div class="w-full max-w-2xl mx-auto">
	<!-- Upload Area -->
	<div
		class="relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 {selectedFile
			? 'border-green-400 bg-green-50'
			: 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50 cursor-pointer'}"
		role="button"
		tabindex="0"
		onclick={triggerFileInput}
		onkeydown={(e) => e.key === 'Enter' && triggerFileInput()}
	>
		<!-- Hidden file input -->
		<input
			bind:this={fileInput}
			type="file"
			accept=".csv"
			class="hidden"
			onchange={handleFileInputChange}
			disabled={isProcessing}
		/>

		{#if selectedFile}
			<!-- File Selected State -->
			<div class="space-y-4">
				<div class="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
					<svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				</div>
				<div>
					<h3 class="text-lg font-medium text-gray-900">{MESSAGES.FILE_SELECTED}</h3>
					<p class="text-sm text-gray-600 mt-1">{selectedFile.name}</p>
					<p class="text-xs text-gray-500 mt-1">
						{(selectedFile.size / 1024).toFixed(1)} KB
					</p>
				</div>
			</div>
		{:else}
			<!-- Upload State -->
			<div class="space-y-4">
				<div class="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
					<svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
					</svg>
				</div>
				<div>
					<h3 class="text-lg font-medium text-gray-900">{MESSAGES.SELECT_CSV_FILE}</h3>
					<p class="text-sm text-gray-600 mt-1">
						{MESSAGES.CLICK_TO_BROWSE}
					</p>
					<p class="text-xs text-gray-500 mt-2">
						{MESSAGES.FILE_SUPPORT_INFO}
					</p>
				</div>
			</div>
		{/if}
	</div>

	<!-- Action Buttons -->
	{#if selectedFile}
		<div class="mt-6 flex justify-center space-x-4">
			<button
				type="button"
				class="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
				onclick={clearFile}
				disabled={isProcessing}
			>
				{MESSAGES.CLEAR_BUTTON}
			</button>
			<button
				type="button"
				class="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
				onclick={processFile}
				disabled={isProcessing}
			>
				{#if isProcessing}
					<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
					{MESSAGES.PROCESSING_BUTTON}
				{:else}
					{MESSAGES.PROCESS_FILE_BUTTON}
				{/if}
			</button>
		</div>
	{/if}

	<!-- Processing Indicator -->
	{#if isProcessing}
		<div class="mt-6 text-center">
			<div class="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
				<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
					<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 718-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
				</svg>
				<span class="text-blue-700 font-medium">{MESSAGES.PROCESSING_STATUS}</span>
			</div>
		</div>
	{/if}

	<!-- Instructions -->
	<div class="mt-8 text-sm text-gray-500 space-y-2">
		<h4 class="font-medium text-gray-700">{MESSAGES.EXPECTED_FORMAT}</h4>
		<ul class="list-disc list-inside space-y-1 ml-4">
			<li><strong>{MESSAGES.MONITORING_LOCATION_DESC}</strong></li>
			<li><strong>{MESSAGES.CHARACTERISTIC_NAME_DESC}</strong></li>
			<li><strong>{MESSAGES.RESULT_VALUE_DESC}</strong></li>
		</ul>
		<p class="mt-4 text-xs">
			{MESSAGES.CALCULATION_INFO}
		</p>
	</div>
</div>