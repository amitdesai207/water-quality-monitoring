import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import type { TemperatureData } from '$lib/types';
import neatCsv from 'neat-csv';

// Constants for error messages and validation
const ERROR_MESSAGES = {
	NO_FILE_PROVIDED: 'No CSV file provided',
	INVALID_FILE_TYPE: 'File must be a CSV file',
	FILE_TOO_LARGE: 'File size must be less than 10MB',
	EMPTY_FILE: 'CSV file is empty',
	INSUFFICIENT_DATA: 'CSV file must contain at least a header row and one data row',
	MISSING_LOCATION_COLUMN: 'CSV must contain a MonitoringLocationID column',
	NO_TEMPERATURE_DATA: 'No temperature data found. Please ensure your CSV contains rows with CharacteristicName="Temperature, water" and valid ResultValue numbers.',
	NO_VALID_DATA: 'No valid temperature data found in the CSV file',
	PROCESSING_ERROR: 'Unknown error occurred while processing CSV',
	CSV_PARSING_FAILED: 'CSV parsing failed'
};

const LOG_MESSAGES = {
	PROCESSING_STATS: 'Processed {rows} rows, found {temperatureRows} temperature measurements for {locations} locations',
	CSV_PROCESSING_ERROR: 'CSV processing error:'
};

const VALIDATION_RULES = {
	MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
	REQUIRED_COLUMNS: {
		LOCATION: 'monitoringlocationid',
		CHARACTERISTIC: 'characteristicname',
		VALUE: 'resultvalue'
	},
	TARGET_CHARACTERISTIC: 'temperature, water'
};

const PROCESSING_CONFIG = {
	DECIMAL_PLACES: 2,
	LOG_PROCESSING_STATS: true
};

/**
 * Validates file basic properties (type, size, content)
 * @param file - File object to validate
 * @param content - File content string
 * @returns Validation result object
 */
function validateFileBasics(file: File, content: string): { isValid: boolean; error?: string } {
	// Check file type
	if (!file.name.toLowerCase().endsWith('.csv')) {
		return { isValid: false, error: ERROR_MESSAGES.INVALID_FILE_TYPE };
	}

	// Check file size
	if (file.size > VALIDATION_RULES.MAX_FILE_SIZE) {
		return { isValid: false, error: ERROR_MESSAGES.FILE_TOO_LARGE };
	}

	// Check if file is empty
	if (!content.trim()) {
		return { isValid: false, error: ERROR_MESSAGES.EMPTY_FILE };
	}

	return { isValid: true };
}


/**
 * Validates if a row contains temperature data
 * @param characteristic - Characteristic name from the row
 * @returns Boolean indicating if this is temperature data
 */
function isTemperatureData(characteristic: string): boolean {
	return characteristic.toLowerCase().trim() === VALIDATION_RULES.TARGET_CHARACTERISTIC;
}


/**
 * Main CSV processing function for water quality data using neat-csv
 * Extracts temperature measurements and calculates averages by monitoring location
 * @param csvContent - Raw CSV file content as string
 * @returns Object mapping location IDs to average temperatures
 * @throws Error if CSV format is invalid or no temperature data found
 */
async function processWaterQualityCSV(csvContent: string): Promise<TemperatureData> {
	try {
		// Parse CSV with neat-csv - handles all edge cases automatically
		const rows = await neatCsv(csvContent, {
			mapHeaders: ({ header }) => header.toLowerCase().trim()
		});

		// Validate that we have the required columns
		if (rows.length === 0) {
			throw new Error(ERROR_MESSAGES.INSUFFICIENT_DATA);
		}

		const firstRow = rows[0];
		if (!firstRow.monitoringlocationid || !firstRow.characteristicname || !firstRow.resultvalue) {
			throw new Error(ERROR_MESSAGES.MISSING_LOCATION_COLUMN);
		}

		// Extract temperature data using functional approach
		const temperatureRows = rows
			.map(row => ({
				locationId: row.monitoringlocationid?.trim(),
				characteristic: row.characteristicname?.trim(),
				valueStr: row.resultvalue?.trim()
			}))
			.filter(row => 
				row.locationId && 
				row.characteristic && 
				row.valueStr && 
				isTemperatureData(row.characteristic)
			)
			.map(row => ({
				locationId: row.locationId!,
				value: parseFloat(row.valueStr!)
			}))
			.filter(({ value }) => !isNaN(value));

		if (temperatureRows.length === 0) {
			throw new Error(ERROR_MESSAGES.NO_TEMPERATURE_DATA);
		}

		// Group by location using reduce
		const groupedData = temperatureRows.reduce((acc, { locationId, value }) => {
			if (!acc[locationId]) {
				acc[locationId] = [];
			}
			acc[locationId].push(value);
			return acc;
		}, {} as Record<string, number[]>);

		// Calculate averages using reduce
		const results = Object.entries(groupedData).reduce((acc, [locationId, values]) => {
			const average = values.reduce((sum, val) => sum + val, 0) / values.length;
			acc[locationId] = Math.round(average * Math.pow(10, PROCESSING_CONFIG.DECIMAL_PLACES)) / Math.pow(10, PROCESSING_CONFIG.DECIMAL_PLACES);
			return acc;
		}, {} as TemperatureData);

		if (PROCESSING_CONFIG.LOG_PROCESSING_STATS) {
			console.log(LOG_MESSAGES.PROCESSING_STATS
				.replace('{rows}', rows.length.toString())
				.replace('{temperatureRows}', temperatureRows.length.toString())
				.replace('{locations}', Object.keys(results).length.toString())
			);
		}
		
		return results;
	} catch (error) {
		if (error instanceof Error) {
			throw error;
		}
		throw new Error(`${ERROR_MESSAGES.CSV_PARSING_FAILED}: ${error}`);
	}
}

/**
 * API endpoint for processing CSV files containing water quality data
 * Accepts multipart/form-data with a CSV file and returns temperature averages
 * @param request - SvelteKit request object containing form data
 * @returns JSON response with location ID to average temperature mapping
 */
export const POST: RequestHandler = async ({ request }) => {
	try {
		const formData = await request.formData();
		const csvFile = formData.get('csvFile') as File;

		if (!csvFile) {
			throw error(400, { message: ERROR_MESSAGES.NO_FILE_PROVIDED });
		}

		// Read file content
		const csvContent = await csvFile.text();
		
		// Validate file basics
		const fileValidation = validateFileBasics(csvFile, csvContent);
		if (!fileValidation.isValid) {
			throw error(400, { message: fileValidation.error! });
		}

		// Process the CSV
		const results = await processWaterQualityCSV(csvContent);

		if (Object.keys(results).length === 0) {
			throw error(400, { message: ERROR_MESSAGES.NO_VALID_DATA });
		}

		return json(results);

	} catch (err) {
		console.error(LOG_MESSAGES.CSV_PROCESSING_ERROR, err);
		
		if (err && typeof err === 'object' && 'status' in err) {
			// Re-throw SvelteKit errors
			throw err;
		}
		
		// Handle other errors
		const message = err instanceof Error ? err.message : ERROR_MESSAGES.PROCESSING_ERROR;
		throw error(500, { message });
	}
};