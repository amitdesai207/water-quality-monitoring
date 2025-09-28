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
 * Temperature table row structure for DataTable component
 */
export interface TemperatureTableRow {
	location: string;
	temperature: number;
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

// Temperature DataTable component types
export type SortDirection = 'asc' | 'desc';
export type TemperatureSortField = 'location' | 'temperature';

/**
 * Props for the temperature-specific DataTable component
 */
export interface TemperatureDataTableProps {
	data: TemperatureTableRow[];
	searchable?: boolean;
	sortable?: boolean;
	paginated?: boolean;
	itemsPerPage?: number;
	loading?: boolean;
	emptyMessage?: string;
	searchPlaceholder?: string;
	onRowClick?: (row: TemperatureTableRow, index: number) => void;
}

/**
 * Internal state for the temperature DataTable component
 */
export interface TemperatureTableState {
	sortField: TemperatureSortField;
	sortDirection: SortDirection;
	searchTerm: string;
	currentPage: number;
}