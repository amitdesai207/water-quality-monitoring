import type { Snippet } from 'svelte';
/**
 * Props for the FileUpload component
 */
export interface FileUploadProps {
	onfileprocessed?: (results: TemperatureData) => void;
	onprocessingstart?: () => void;
	onerror?: (error: string) => void;
}

/**
 * Props for the ResultsDisplay component
 */
export interface ResultsDisplayProps {
	/** Temperature data to display - mapping of location IDs to average temperatures */
	results: TemperatureData;
}

/**
 * Temperature data structure mapping monitoring location IDs to average temperatures
 */
export interface TemperatureData {
	/** Average temperature per monitoring location */
	[locationId: string]: number;
}

/**
 * Props for the ErrorBoundary component
 */
export interface ErrorBoundaryProps {
	children?: Snippet;
	fallback?: Snippet;
	onError?: (error: Error, errorInfo: any) => void;
	title?: string;
	message?: string;
	onRetry?: () => void;
}

/**
 * Props for the ErrorFallback component
 */
export interface ErrorFallbackProps {
	title?: string;
	message?: string;
	onRetry?: () => void;
	children?: Snippet;
}