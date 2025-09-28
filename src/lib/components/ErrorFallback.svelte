<script lang="ts">
	import type { ErrorFallbackProps } from '$lib/types/index.js';

	// Content text constants
	const CONTENT_TEXT = {
		TITLE: 'Something went wrong',
		MESSAGE: 'An unexpected error occurred. Please try again or contact support if the problem persists.',
		RETRY_BUTTON: 'Try Again',
		RELOAD_BUTTON: 'Reload Page',
		CONTACT_SUPPORT: 'If this problem persists, please contact support'
	};

	let { 
		title = CONTENT_TEXT.TITLE,
		message = CONTENT_TEXT.MESSAGE,
		onRetry,
		children
	}: ErrorFallbackProps = $props();

	/**
	 * Reloads the current page to provide a fresh start
	 * This is a fallback option when retry doesn't work
	 * 
	 * @returns {void}
	 */
	function reloadPage() {
		window.location.reload();
	}
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md w-full space-y-8">
		<div class="text-center">
			<!-- Error Icon -->
			<div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
				<svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
				</svg>
			</div>
			
			<!-- Error Title -->
			<h2 class="mt-6 text-3xl font-extrabold text-gray-900">
				{title}
			</h2>
			
			<!-- Error Message -->
			<p class="mt-2 text-sm text-gray-600">
				{message}
			</p>
		</div>

		<!-- Action Buttons -->
		<div class="flex flex-col sm:flex-row gap-3">
			{#if onRetry}
				<button
					onclick={onRetry}
					class="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
				>
					<svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
					</svg>
					{CONTENT_TEXT.RETRY_BUTTON}
				</button>
			{/if}
			
			<button
				onclick={reloadPage}
				class="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
			>
				<svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
				</svg>
				{CONTENT_TEXT.RELOAD_BUTTON}
			</button>
		</div>

		<!-- Support Information -->
		<div class="text-center">
			<p class="text-xs text-gray-500">
				{CONTENT_TEXT.CONTACT_SUPPORT}
			</p>
		</div>

		<!-- Custom fallback content -->
		{#if children}
			{@render children()}
		{/if}
	</div>
</div>
