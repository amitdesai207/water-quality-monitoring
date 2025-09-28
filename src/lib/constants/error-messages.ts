/**
 * Centralized error messages
 */

export const ERROR_MESSAGES = {
    // File validation errors
    INVALID_FILE_TYPE: 'Please select a CSV file.',
    FILE_TOO_LARGE: 'File size must be less than 10MB.',
    EMPTY_FILE: 'CSV file is empty',
    NO_FILE_PROVIDED: 'No CSV file provided',
    FILE_READ_ERROR: 'Failed to read file content',

    // CSV processing errors
    INSUFFICIENT_DATA: 'CSV file must contain at least a header row and one data row',
    MISSING_REQUIRED_COLUMNS: 'CSV must contain required columns',
    NO_TEMPERATURE_DATA: 'No temperature data found. Please ensure your CSV contains rows with CharacteristicName="Temperature, water" and valid ResultValue numbers.',
    NO_VALID_DATA: 'No valid temperature data found in the CSV file',
    CSV_PARSING_FAILED: 'CSV parsing failed',

    // Server and processing errors
    PROCESSING_ERROR: 'Unknown error occurred while processing CSV',
    PROCESSING_FAILED: 'Failed to process file',
    SERVER_ERROR: 'Server error. Please try again later.',
    VALIDATION_ERROR: 'File validation failed',
    INVALID_REQUEST: 'Invalid request format',
    UNKNOWN_ERROR: 'Unknown error occurred',

    // Error boundary and system errors
    UNHANDLED_REJECTION: 'Unhandled promise rejection:',
    UNCAUGHT_ERROR: 'Uncaught error:',
    ERROR_BOUNDARY_CAUGHT_ERROR: 'ErrorBoundary caught an error:',
} as const;
