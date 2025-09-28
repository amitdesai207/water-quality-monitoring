<script lang="ts">
	import { onMount } from 'svelte';
	import ErrorFallback from './ErrorFallback.svelte';
	import { ERROR_MESSAGES } from '$lib/constants/error-messages';

	import type { ErrorBoundaryProps } from '$lib/types/index.js';

	// Content text constants
	const CONTENT_TEXT = {
		DEFAULT_TITLE: 'Something went wrong',
		DEFAULT_MESSAGE: 'An unexpected error occurred. Please try again or contact support if the problem persists.'
	};


    const ERROR_TYPES = {
        UNHANDLED_REJECTION: 'unhandledRejection',
        UNCAUGHT_ERROR: 'uncaughtError'
    };

	let { 
		children,
		fallback,
		onError,
		title = CONTENT_TEXT.DEFAULT_TITLE,
		message = CONTENT_TEXT.DEFAULT_MESSAGE,
		onRetry
	}: ErrorBoundaryProps = $props();

	let hasError = $state(false);
	let error = $state<Error | null>(null);
	let errorInfo = $state<any>(null);

	/**
	 * Handles component errors and provides fallback UI
	 * Catches JavaScript errors in the component tree and displays a user-friendly error message
	 * while logging detailed information to the console for debugging purposes
	 * 
	 * @param {Error} err - The error that occurred in the component
	 * @param {any} info - Additional error information including component stack trace
	 * @returns {void}
	 */
	function handleError(err: Error, info: any) {
		hasError = true;
		error = err;
		errorInfo = info;
		
		console.error(ERROR_MESSAGES.ERROR_BOUNDARY_CAUGHT_ERROR, {
			message: err.message,
			stack: err.stack,
			componentStack: info?.componentStack,
			timestamp: new Date().toISOString()
		});
		
		if (onError) {
			onError(err, info);
		}
	}

	/**
	 * Resets the error boundary state to allow retry attempts
	 * Clears the error state and allows the component to re-render normally
	 * This function is called when the user clicks the retry button
	 * 
	 * @returns {void}
	 */
	function resetError() {
		hasError = false;
		error = null;
		errorInfo = null;
	}

	/**
	 * Handles retry action when user clicks the retry button
	 * Resets the error boundary state and calls the optional onRetry callback
	 * This allows the component to attempt rendering again after an error
	 * 
	 * @returns {void}
	 */
	function handleRetry() {
		resetError();
		if (onRetry) {
			onRetry();
		}
	}


	/**
	 * Handles unhandled promise rejections globally
	 * Catches promises that are rejected but not caught by try-catch blocks
	 * This prevents unhandled promise rejections from crashing the application
	 * 
	 * @param {PromiseRejectionEvent} event - The promise rejection event
	 * @returns {void}
	 */
	function handleUnhandledRejection(event: PromiseRejectionEvent) {
		console.error(ERROR_MESSAGES.UNHANDLED_REJECTION, event.reason);
		handleError(new Error(event.reason), { type: ERROR_TYPES.UNHANDLED_REJECTION });
	}

	/**
	 * Handles uncaught JavaScript errors globally
	 * Catches errors that are not handled by try-catch blocks or error boundaries
	 * This provides a last line of defense against application crashes
	 * 
	 * @param {ErrorEvent} event - The error event containing error details
	 * @returns {void}
	 */
	function handleErrorEvent(event: ErrorEvent) {
		console.error(ERROR_MESSAGES.UNCAUGHT_ERROR, event.error);
		handleError(event.error, { type: ERROR_TYPES.UNCAUGHT_ERROR });
	}

	onMount(() => {
		// Add global error handlers
		window.addEventListener('unhandledrejection', handleUnhandledRejection);
		window.addEventListener('error', handleErrorEvent);

		return () => {
			// Cleanup
			window.removeEventListener('unhandledrejection', handleUnhandledRejection);
			window.removeEventListener('error', handleErrorEvent);
		};
	});
</script>

{#if hasError}
	<!-- Use generic error fallback -->
	<ErrorFallback 
		{title}
		{message}
		onRetry={handleRetry}
	>
		{@render fallback?.()}
	</ErrorFallback>
{:else}
	<!-- Render children normally -->
	{@render children?.()}
{/if}
