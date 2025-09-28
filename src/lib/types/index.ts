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