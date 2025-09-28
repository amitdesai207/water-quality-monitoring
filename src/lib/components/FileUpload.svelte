<script lang="ts">
	import type { FileUploadProps } from '$lib/types';
	import { ERROR_MESSAGES } from '$lib/constants/error-messages';

	let { 
		onfileprocessed = () => {}, 
		onprocessingstart = () => {}, 
		onerror = () => {} 
	}: FileUploadProps = $props();

	let fileInput = $state<HTMLInputElement>();
	let selectedFile = $state<File | null>(null);
	let isProcessing = $state(false);
	let error = $state<string | null>(null);
	let retryCount = $state(0);
	let lastError = $state<Error | null>(null);

	// Content text constants
	const CONTENT_TEXT = {
		FILE_SELECTED: 'File Selected',
		SELECT_CSV_FILE: 'Select CSV File',
		CLICK_TO_BROWSE: 'Click here to browse and select your CSV file',
		FILE_SUPPORT_INFO: 'Supports files up to 10MB • CSV format only',
		PROCESSING_BUTTON: 'Processing...',
		PROCESS_FILE_BUTTON: 'Process File',
		CLEAR_BUTTON: 'Clear',
		EXPECTED_FORMAT: 'Expected CSV Format:',
		MONITORING_LOCATION_DESC: 'MonitoringLocationID: Unique identifier for each monitoring site',
		CHARACTERISTIC_NAME_DESC: 'CharacteristicName: Must include "Temperature, water" entries',
		RESULT_VALUE_DESC: 'ResultValue: Numeric temperature values',
		RETRY_BUTTON: 'Retry',
		PROCESSING_STATUS: 'Processing CSV file...',
		DISMISS_BUTTON: 'Dismiss',
		ERROR_TITLE: 'Upload Error'
	};


	const VALIDATION = {
		MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
		ALLOWED_EXTENSION: '.csv',
		ALLOWED_MIME_TYPES: [
			'text/csv',
			'application/csv',
			'text/plain'
		]
	};

	/**
	 * Validates a file for type and size requirements
	 * Checks file extension, MIME type, and size to ensure it meets application requirements
	 * 
	 * @param {File} file - File object to validate
	 * @returns {{isValid: boolean, error?: string}} Object with isValid boolean and error message if invalid
	 */
	function validateFile(file: File): { isValid: boolean; error?: string } {
		// Check file extension
		if (!file.name.toLowerCase().endsWith(VALIDATION.ALLOWED_EXTENSION)) {
			return { isValid: false, error: ERROR_MESSAGES.INVALID_FILE_TYPE };
		}

		// Check MIME type for additional security
		if (!VALIDATION.ALLOWED_MIME_TYPES.includes(file.type)) {
			return { 
				isValid: false, 
				error: `Invalid file type. Expected CSV file, got: ${file.type || 'unknown'}` 
			};
		}

		// Check file size
		if (file.size > VALIDATION.MAX_FILE_SIZE) {
			return { isValid: false, error: ERROR_MESSAGES.FILE_TOO_LARGE };
		}

		// Check for empty file
		if (file.size === 0) {
			return { isValid: false, error: 'File is empty' };
		}

		return { isValid: true };
	}

	/**
	 * Handles file input change events from file picker
	 * Processes selected files from file input element and triggers file selection
	 * 
	 * @param {Event} event - Input change event from file input element
	 * @returns {void}
	 */
	function handleFileInputChange(event: Event) {
		onprocessingstart();
		clearError();
		const target = event.target as HTMLInputElement;
		const files = target.files;
		if (files && files.length > 0) {
			handleFileSelection(files[0]);
		}
	}

	/**
	 * Validates and processes a selected file
	 * Uses consolidated validation function to check file requirements
	 * 
	 * @param {File} file - File object to validate and process
	 * @returns {void}
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
	 * Gets error message from error object
	 * 
	 * @param {unknown} err - The error that occurred
	 * @returns {string} Error message
	 */
	function getErrorMessage(err: unknown): string {
		return err instanceof Error ? err.message : ERROR_MESSAGES.UNKNOWN_ERROR;
	}

	/**
	 * Uploads file to the API
	 * 
	 * @param {File} file - The file to upload
	 * @returns {Promise<Response>} The API response
	 */
	async function uploadFile(file: File): Promise<Response> {
		const formData = new FormData();
		formData.append('csvFile', file);

		return await fetch('/api/process-csv', {
			method: 'POST',
			body: formData
		});
	}

	/**
	 * Handles API response errors
	 * 
	 * @param {Response} response - The API response
	 * @returns {Promise<string>} Error message
	 */
	async function handleApiResponse(response: Response): Promise<string> {
		let errorMessage: string = ERROR_MESSAGES.PROCESSING_FAILED;
		
		try {
			const errorData = await response.json();
			errorMessage = errorData.error || errorMessage;
		} catch {
			// If we can't parse the error response, use status-based messages
			if (response.status >= 500) {
				errorMessage = ERROR_MESSAGES.SERVER_ERROR;
			} else if (response.status === 413) {
				errorMessage = ERROR_MESSAGES.FILE_TOO_LARGE;
			} else if (response.status === 400) {
				errorMessage = ERROR_MESSAGES.VALIDATION_ERROR;
			}
		}
		
		return errorMessage;
	}
    

	/**
	 * Resets form state after successful processing
	 */
	function resetFormState(): void {
		selectedFile = null;
		error = null;
		retryCount = 0;
		lastError = null;
		if (fileInput) fileInput.value = '';
	}

	/**
	 * Handles processing errors
	 * 
	 * @param {unknown} err - The error that occurred
	 */
	function handleProcessingError(err: unknown): void {
		const errorMessage = getErrorMessage(err);
		error = errorMessage;
		lastError = err instanceof Error ? err : new Error(String(err));
		onerror(errorMessage);
	}

	/**
	 * Processes the selected CSV file by sending it to the API
	 * 
	 * @returns {Promise<void>} Promise that resolves when processing is complete
	 */
	async function processFile() {
		if (!selectedFile) return;

		isProcessing = true;
		error = null;
		onprocessingstart();

		try {
			const response = await uploadFile(selectedFile);

			if (!response.ok) {
				const errorMessage = await handleApiResponse(response);
				throw new Error(errorMessage);
			}

			const results = await response.json();
			onfileprocessed(results);
			resetFormState();

		} catch (err) {
			handleProcessingError(err);
		} finally {
			isProcessing = false;
		}
	}

	/**
	 * Retries the file processing operation
	 * Increments retry count and attempts to process the file again
	 * 
	 * @returns {Promise<void>} Promise that resolves when retry is complete
	 */
	async function retryProcessing() {
		retryCount++;
		await processFile();
	}

	/**
	 * Clears the current error state
	 * Resets error variables and retry count to allow fresh attempts
	 * 
	 * @returns {void}
	 */
	function clearError() {
		error = null;
		lastError = null;
		retryCount = 0;
	}

	/**
	 * Clears the currently selected file
	 * Resets both component state and file input value to allow new file selection
	 * 
	 * @returns {void}
	 */
	function clearFile() {
		selectedFile = null;
		if (fileInput) fileInput.value = '';
	}

	/**
	 * Triggers the file input element
	 * Opens the file picker dialog when not processing
	 * 
	 * @returns {void}
	 */
	function triggerFileInput() {
		if (!isProcessing) {
			fileInput?.click();
		}
	}
</script>

<div class="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
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
					<h3 class="text-lg font-medium text-gray-900">{CONTENT_TEXT.FILE_SELECTED}</h3>
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
					<h3 class="text-lg font-medium text-gray-900">{CONTENT_TEXT.SELECT_CSV_FILE}</h3>
					<p class="text-sm text-gray-600 mt-1">
						{CONTENT_TEXT.CLICK_TO_BROWSE}
					</p>
					<p class="text-xs text-gray-500 mt-2">
						{CONTENT_TEXT.FILE_SUPPORT_INFO}
					</p>
				</div>
			</div>
		{/if}
	</div>

	<!-- Error Display -->
	{#if error}
		<div class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
			<div class="flex items-start">
				<div class="flex-shrink-0">
					<svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
					</svg>
				</div>
				<div class="ml-3 flex-1">
					<h3 class="text-sm font-medium text-red-800">{CONTENT_TEXT.ERROR_TITLE}</h3>
					<p class="text-sm text-red-700 mt-1">{error}</p>
					{#if retryCount < 3}
						<div class="mt-3 flex space-x-3">
							<button
								onclick={retryProcessing}
								disabled={isProcessing}
								class="text-sm font-medium text-red-600 hover:text-red-500 disabled:opacity-50"
							>
								{CONTENT_TEXT.RETRY_BUTTON} ({retryCount}/3)
							</button>
							<button
								onclick={clearError}
								class="text-sm font-medium text-red-600 hover:text-red-500"
							>
								{CONTENT_TEXT.DISMISS_BUTTON}
							</button>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}

	<!-- Action Buttons -->
	{#if selectedFile}
		<div class="mt-6 flex justify-center space-x-4">
			<button
				type="button"
				class="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
				onclick={clearFile}
				disabled={isProcessing}
			>
				{CONTENT_TEXT.CLEAR_BUTTON}
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
					{CONTENT_TEXT.PROCESSING_BUTTON}
				{:else}
					{CONTENT_TEXT.PROCESS_FILE_BUTTON}
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
				<span class="text-blue-700 font-medium">{CONTENT_TEXT.PROCESSING_STATUS}</span>
			</div>
		</div>
	{/if}

	<!-- Instructions -->
	<div class="mt-8 text-sm text-gray-500 space-y-2">
		<h4 class="font-medium text-gray-700">{CONTENT_TEXT.EXPECTED_FORMAT}</h4>
		<ul class="list-disc list-inside space-y-1 ml-4">
			<li><strong>{CONTENT_TEXT.MONITORING_LOCATION_DESC}</strong></li>
			<li><strong>{CONTENT_TEXT.CHARACTERISTIC_NAME_DESC}</strong></li>
			<li><strong>{CONTENT_TEXT.RESULT_VALUE_DESC}</strong></li>
		</ul>
	</div>
</div>