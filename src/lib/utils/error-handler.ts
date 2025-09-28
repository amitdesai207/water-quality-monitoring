/**
 * Global error handling utilities 
 */

export interface ErrorContext {
	component?: string;
	action?: string;
	timestamp?: Date;
	url?: string;
}

export interface ErrorReport {
	message: string;
	stack?: string;
	context: ErrorContext;
}



/**
 * Creates a standardized error report with structured information
 * Combines error details with context to create a comprehensive error report
 * that can be used for logging, reporting, and debugging purposes
 * 
 * @param {Error} error - The error that occurred
 * @param {ErrorContext} context - Additional context about the error
 * @returns {ErrorReport} Standardized error report with context
 */
export function createErrorReport(error: Error, context: ErrorContext): ErrorReport {
	return {
		message: error.message,
		stack: error.stack,
		context: {
			...context,
			timestamp: new Date(),
			url: typeof window !== 'undefined' ? window.location.href : undefined
		}
	};
}

/**
 * Logs error to console with structured information
 * Provides consistent error logging with context information
 * 
 * @param {ErrorReport} errorReport - The error report to log
 * @returns {void}
 */
export function logError(errorReport: ErrorReport): void {
	const { message, context } = errorReport;
	
	const logMessage = `[ERROR] ${message}`;
	const logContext = {
		component: context.component,
		action: context.action,
		timestamp: context.timestamp,
		url: context.url
	};
	
	console.error(logMessage, logContext);
}


/**
 * Main error handler that processes errors comprehensively
 * Central function that handles all error processing. This is the main entry point for error handling.
 * 
 * @param {Error} error - The error that occurred
 * @param {ErrorContext} context - Additional context about the error
 * @returns {Promise<void>} Promise that resolves when error handling is complete
 */
export async function handleError(error: Error, context: ErrorContext): Promise<void> {
	try {
		// Create error report
		const errorReport = createErrorReport(error, context);
		
		// Log error
		logError(errorReport);
		
	} catch (handlingError) {
		// Fallback error handling
		console.error('Error in error handler:', handlingError);
	}
}

/**
 * Sets up global error handlers for the application
 * Initializes global event listeners for unhandled errors, promise rejections,
 * and resource loading errors. Should be called once during app initialization.
 * 
 * @returns {void}
 */
export function setupGlobalErrorHandlers(): void {
	if (typeof window === 'undefined') return;

	// Handle unhandled promise rejections
	window.addEventListener('unhandledrejection', (event) => {
		const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
		handleError(error, {
			component: 'global',
			action: 'unhandled-promise-rejection'
		});
	});

	// Handle uncaught errors
	window.addEventListener('error', (event) => {
		const error = event.error instanceof Error ? event.error : new Error(event.message);
		handleError(error, {
			component: 'global',
			action: 'uncaught-error',
			url: event.filename
		});
	});

	// Handle resource loading errors
	window.addEventListener('error', (event) => {
		if (event.target !== window) {
			const error = new Error(`Failed to load resource: ${(event.target as any)?.src || 'unknown'}`);
			handleError(error, {
				component: 'global',
				action: 'resource-load-error'
			});
		}
	}, true);
}
