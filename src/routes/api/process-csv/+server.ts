import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import type { TemperatureData } from '$lib/types';
import neatCsv from 'neat-csv';
import { ERROR_MESSAGES } from '$lib/constants/error-messages';


const LOG_MESSAGES = {
	PROCESSING_STATS: 'Processed {rows} rows, found {temperatureRows} temperature measurements for {locations} locations',
	CSV_PROCESSING_ERROR: 'CSV processing error:'
};

const VALIDATION_RULES = {
	MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
	REQUIRED_COLUMNS: ['monitoringlocationid', 'characteristicname', 'resultvalue'],
	TARGET_CHARACTERISTIC: 'temperature, water'
};

const PROCESSING_CONFIG = {
	DECIMAL_PLACES: 2,
	LOG_PROCESSING_STATS: true
};

/**
 * Validates file basic properties (type, size, content)
 * Checks file type, size, and content to ensure it meets processing requirements
 * 
 * @param {File} file - File object to validate
 * @param {string} content - File content string
 * @returns {{isValid: boolean, error?: string}} Validation result object
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
 * Checks if the characteristic name matches the target temperature characteristic
 * 
 * @param {string} characteristic - Characteristic name from the row
 * @returns {boolean} Boolean indicating if this is temperature data
 */
function isTemperatureData(characteristic: string): boolean {
	return characteristic.toLowerCase().trim() === VALIDATION_RULES.TARGET_CHARACTERISTIC;
}


/**
 * Main CSV processing function for water quality data using neat-csv
 * Extracts temperature measurements and calculates averages by monitoring location
 * 
 * @param {string} csvContent - Raw CSV file content as string
 * @returns {Promise<TemperatureData>} Object mapping location IDs to average temperatures
 * @throws {Error} Error if CSV format is invalid or no temperature data found
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
		const missingColumns = VALIDATION_RULES.REQUIRED_COLUMNS.filter(col => !firstRow[col]);
		if (missingColumns.length > 0) {
			throw new Error(`${ERROR_MESSAGES.MISSING_REQUIRED_COLUMNS}: ${missingColumns.join(', ')}`);
		}

		// Extract temperature data 
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

		// Group by location
		const groupedData = temperatureRows.reduce((acc, { locationId, value }) => {
			if (!acc[locationId]) {
				acc[locationId] = [];
			}
			acc[locationId].push(value);
			return acc;
		}, {} as Record<string, number[]>);

		// Calculate averages
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
 * Validates request method and content type
 * 
 * @param {Request} request - The incoming request
 * @returns {{isValid: boolean, error?: string}} Validation result
 */
function validateRequest(request: Request): { isValid: boolean; error?: string } {
	if (request.method !== 'POST') {
		return { isValid: false, error: 'Method not allowed' };
	}

	const contentType = request.headers.get('content-type');
	if (!contentType || !contentType.includes('multipart/form-data')) {
		return { isValid: false, error: ERROR_MESSAGES.INVALID_REQUEST };
	}

	return { isValid: true };
}

/**
 * Handles API errors 
 * 
 * @param {unknown} err - The error that occurred
 * @returns {never} Throws SvelteKit error response
 */
function handleApiError(err: unknown): never {
	console.error(LOG_MESSAGES.CSV_PROCESSING_ERROR, err);
	
	// Re-throw SvelteKit errors as-is
	if (err && typeof err === 'object' && 'status' in err) {
		throw err;
	}

	// Convert other errors to 500
	const message = err instanceof Error ? err.message : ERROR_MESSAGES.PROCESSING_ERROR;
	throw error(500, { message });
}

/**
 * Extracts and validates CSV file from form data
 * 
 * @param {Request} request - The incoming request
 * @returns {Promise<File>} The validated CSV file
 */
async function extractCsvFile(request: Request): Promise<File> {
	const requestValidation = validateRequest(request);
	if (!requestValidation.isValid) {
		throw error(400, { message: requestValidation.error! });
	}

	let formData: FormData;
	try {
		formData = await request.formData();
	} catch (err) {
		throw error(400, { message: ERROR_MESSAGES.INVALID_REQUEST });
	}

	const csvFile = formData.get('csvFile') as File;
	if (!csvFile) {
		throw error(400, { message: ERROR_MESSAGES.NO_FILE_PROVIDED });
	}

	return csvFile;
}

/**
 * Reads and validates CSV file content
 * 
 * @param {File} csvFile - The CSV file to read
 * @returns {Promise<string>} The validated CSV content
 */
async function readAndValidateCsvContent(csvFile: File): Promise<string> {
	let csvContent: string;
	try {
		csvContent = await csvFile.text();
	} catch (err) {
		throw error(400, { message: ERROR_MESSAGES.FILE_READ_ERROR });
	}

	const fileValidation = validateFileBasics(csvFile, csvContent);
	if (!fileValidation.isValid) {
		throw error(400, { message: fileValidation.error! });
	}

	return csvContent;
}

/**
 * API endpoint for processing CSV files containing water quality data
 * Accepts multipart/form-data with a CSV file and returns temperature averages
 * 
 * @param {RequestEvent} request - SvelteKit request object containing form data
 * @returns {Promise<Response>} JSON response with location ID to average temperature mapping
 */
export const POST: RequestHandler = async ({ request }) => {
	try {
		const csvFile = await extractCsvFile(request);
		const csvContent = await readAndValidateCsvContent(csvFile);
		const results = await processWaterQualityCSV(csvContent);

		if (Object.keys(results).length === 0) {
			throw error(400, { message: ERROR_MESSAGES.NO_VALID_DATA });
		}

		return json(results, {
			status: 200,
			headers: {
				'Cache-Control': 'no-cache',
				'Content-Type': 'application/json'
			}
		});

	} catch (err) {
		handleApiError(err);
	}
};