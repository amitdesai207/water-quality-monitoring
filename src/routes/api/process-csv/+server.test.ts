import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './+server';
import { ERROR_MESSAGES } from '$lib/constants/error-messages';

// Mock neat-csv
vi.mock('neat-csv', () => ({
	default: vi.fn()
}));

// Mock SvelteKit functions
vi.mock('@sveltejs/kit', () => ({
	json: vi.fn((data, options) => ({
		json: () => Promise.resolve(data),
		status: options?.status || 200,
		headers: options?.headers || {}
	})),
	error: vi.fn((status, body) => {
		const err = new Error(body?.message || 'Error') as any;
		err.status = status;
		err.body = body;
		throw err;
	})
}));

// Import mocked modules
import neatCsv from 'neat-csv';
import { json, error } from '@sveltejs/kit';

const mockNeatCsv = neatCsv as any;
const mockJson = json as any;
const mockError = error as any;

// Mock File and FormData for testing
class MockFile {
	name: string;
	size: number;
	type: string;
	private content: string;

	constructor(content: string[], name: string, options: any = {}) {
		this.name = name;
		this.size = content.join('').length;
		this.type = options.type || 'text/csv';
		this.content = content.join('');
	}

	async text() {
		return this.content;
	}
}

class MockFormData {
	private data = new Map<string, any>();
	
	append(key: string, value: any) {
		this.data.set(key, value);
	}
	
	get(key: string) {
		return this.data.get(key);
	}
}

// Mock global objects
global.File = MockFile as any;
global.FormData = MockFormData as any;

describe('CSV Processing API (+server.ts)', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('POST Handler - Success Cases', () => {
		it('should process valid CSV data and return temperature averages', async () => {
			// Mock CSV data that neat-csv would return
			const mockCsvData = [
				{
					monitoringlocationid: 'LOC001',
					characteristicname: 'Temperature, water',
					resultvalue: '20.5'
				},
				{
					monitoringlocationid: 'LOC001',
					characteristicname: 'Temperature, water',
					resultvalue: '21.5'
				},
				{
					monitoringlocationid: 'LOC002',
					characteristicname: 'Temperature, water',
					resultvalue: '18.0'
				}
			];

			mockNeatCsv.mockResolvedValue(mockCsvData);

			// Create mock CSV file
			const csvContent = `MonitoringLocationID,CharacteristicName,ResultValue
LOC001,Temperature water,20.5
LOC001,Temperature water,21.5
LOC002,Temperature water,18.0`;
			
			const csvFile = new MockFile([csvContent], 'test.csv', { type: 'text/csv' });
			const formData = new MockFormData();
			formData.append('csvFile', csvFile);

			// Create mock request
			const request = new Request('http://localhost/api/process-csv', {
				method: 'POST',
				headers: {
					'content-type': 'multipart/form-data'
				},
				body: formData as any
			});

			vi.spyOn(request, 'formData').mockResolvedValue(formData as any);

			const response = await POST({ request } as any);

			// Verify the response
			expect(response).toBeDefined();
			expect(mockJson).toHaveBeenCalledWith(
				{ LOC001: 21, LOC002: 18 },
				expect.objectContaining({
					status: 200,
					headers: expect.objectContaining({
						'Cache-Control': 'no-cache',
						'Content-Type': 'application/json'
					})
				})
			);
		});

		it('should filter out non-temperature data correctly', async () => {
			const mockCsvData = [
				{
					monitoringlocationid: 'LOC001',
					characteristicname: 'Temperature, water',
					resultvalue: '20.5'
				},
				{
					monitoringlocationid: 'LOC001',
					characteristicname: 'pH',
					resultvalue: '7.5'
				},
				{
					monitoringlocationid: 'LOC002',
					characteristicname: 'Dissolved Oxygen',
					resultvalue: '8.2'
				}
			];

			mockNeatCsv.mockResolvedValue(mockCsvData);

			const csvContent = `MonitoringLocationID,CharacteristicName,ResultValue
LOC001,Temperature water,20.5
LOC001,pH,7.5
LOC002,Dissolved Oxygen,8.2`;
			
			const csvFile = new MockFile([csvContent], 'test.csv', { type: 'text/csv' });
			const formData = new MockFormData();
			formData.append('csvFile', csvFile);

			const request = new Request('http://localhost/api/process-csv', {
				method: 'POST',
				headers: { 'content-type': 'multipart/form-data' },
				body: formData as any
			});

			vi.spyOn(request, 'formData').mockResolvedValue(formData as any);

			// Should only process temperature data
			const response = await POST({ request } as any);
			expect(response).toBeDefined();
			expect(mockJson).toHaveBeenCalledWith(
				{ LOC001: 20.5 },
				expect.any(Object)
			);
		});

		it('should handle multiple measurements per location', async () => {
			const mockCsvData = [
				{
					monitoringlocationid: 'LOC001',
					characteristicname: 'Temperature, water',
					resultvalue: '20.0'
				},
				{
					monitoringlocationid: 'LOC001',
					characteristicname: 'Temperature, water',
					resultvalue: '22.0'
				},
				{
					monitoringlocationid: 'LOC001',
					characteristicname: 'Temperature, water',
					resultvalue: '21.0'
				}
			];

			mockNeatCsv.mockResolvedValue(mockCsvData);

			const csvContent = `MonitoringLocationID,CharacteristicName,ResultValue
LOC001,Temperature water,20.0
LOC001,Temperature water,22.0
LOC001,Temperature water,21.0`;
			
			const csvFile = new MockFile([csvContent], 'test.csv', { type: 'text/csv' });
			const formData = new MockFormData();
			formData.append('csvFile', csvFile);

			const request = new Request('http://localhost/api/process-csv', {
				method: 'POST',
				headers: { 'content-type': 'multipart/form-data' },
				body: formData as any
			});

			vi.spyOn(request, 'formData').mockResolvedValue(formData as any);

			const response = await POST({ request } as any);
			expect(response).toBeDefined();
			expect(mockJson).toHaveBeenCalledWith(
				{ LOC001: 21 }, // Average of 20, 22, 21
				expect.any(Object)
			);
		});

		it('should filter out invalid numeric values', async () => {
			const mockCsvData = [
				{
					monitoringlocationid: 'LOC001',
					characteristicname: 'Temperature, water',
					resultvalue: '20.5'
				},
				{
					monitoringlocationid: 'LOC001',
					characteristicname: 'Temperature, water',
					resultvalue: 'invalid'
				},
				{
					monitoringlocationid: 'LOC001',
					characteristicname: 'Temperature, water',
					resultvalue: '21.5'
				}
			];

			mockNeatCsv.mockResolvedValue(mockCsvData);

			const csvContent = `MonitoringLocationID,CharacteristicName,ResultValue
LOC001,Temperature water,20.5
LOC001,Temperature water,invalid
LOC001,Temperature water,21.5`;
			
			const csvFile = new MockFile([csvContent], 'test.csv', { type: 'text/csv' });
			const formData = new MockFormData();
			formData.append('csvFile', csvFile);

			const request = new Request('http://localhost/api/process-csv', {
				method: 'POST',
				headers: { 'content-type': 'multipart/form-data' },
				body: formData as any
			});

			vi.spyOn(request, 'formData').mockResolvedValue(formData as any);

			// Should only process valid numeric values
			const response = await POST({ request } as any);
			expect(response).toBeDefined();
			expect(mockJson).toHaveBeenCalledWith(
				{ LOC001: 21 }, // Average of 20.5 and 21.5
				expect.any(Object)
			);
		});
	});

	describe('POST Handler - Request Validation Errors', () => {
		it('should reject non-POST requests', async () => {
			const request = new Request('http://localhost/api/process-csv', {
				method: 'GET',
				headers: { 'content-type': 'multipart/form-data' }
			});

			await expect(POST({ request } as any)).rejects.toThrow();
			expect(mockError).toHaveBeenCalledWith(400, { message: 'Method not allowed' });
		});
	});

	describe('POST Handler - File Validation Errors', () => {
		it('should reject requests without CSV file', async () => {
			const formData = new MockFormData();

			const request = new Request('http://localhost/api/process-csv', {
				method: 'POST',
				headers: { 'content-type': 'multipart/form-data' },
				body: formData as any
			});

			vi.spyOn(request, 'formData').mockResolvedValue(formData as any);

			await expect(POST({ request } as any)).rejects.toThrow();
			expect(mockError).toHaveBeenCalledWith(400, { message: ERROR_MESSAGES.NO_FILE_PROVIDED });
		});


		it('should reject files that are too large', async () => {
			const largeContent = 'x'.repeat(11 * 1024 * 1024); // 11MB
			const largeFile = new MockFile([largeContent], 'test.csv', { type: 'text/csv' });
			const formData = new MockFormData();
			formData.append('csvFile', largeFile);

			const request = new Request('http://localhost/api/process-csv', {
				method: 'POST',
				headers: { 'content-type': 'multipart/form-data' },
				body: formData as any
			});

			vi.spyOn(request, 'formData').mockResolvedValue(formData as any);

			await expect(POST({ request } as any)).rejects.toThrow();
			expect(mockError).toHaveBeenCalledWith(400, { message: ERROR_MESSAGES.FILE_TOO_LARGE });
		});

		it('should reject empty files', async () => {
			const emptyFile = new MockFile([''], 'test.csv', { type: 'text/csv' });
			const formData = new MockFormData();
			formData.append('csvFile', emptyFile);

			const request = new Request('http://localhost/api/process-csv', {
				method: 'POST',
				headers: { 'content-type': 'multipart/form-data' },
				body: formData as any
			});

			vi.spyOn(request, 'formData').mockResolvedValue(formData as any);

			await expect(POST({ request } as any)).rejects.toThrow();
			expect(mockError).toHaveBeenCalledWith(400, { message: ERROR_MESSAGES.EMPTY_FILE });
		});
	});

	describe('POST Handler - CSV Data Validation Errors', () => {
		it('should handle CSV with missing required columns', async () => {
			const mockCsvData = [
				{
					locationid: 'LOC001', // Wrong column name
					characteristic: 'Temperature, water', // Wrong column name
					value: '20.5' // Wrong column name
				}
			];

			mockNeatCsv.mockResolvedValue(mockCsvData);

			const csvContent = `LocationID,Characteristic,Value
LOC001,Temperature water,20.5`;
			
			const csvFile = new MockFile([csvContent], 'test.csv', { type: 'text/csv' });
			const formData = new MockFormData();
			formData.append('csvFile', csvFile);

			const request = new Request('http://localhost/api/process-csv', {
				method: 'POST',
				headers: { 'content-type': 'multipart/form-data' },
				body: formData as any
			});

			vi.spyOn(request, 'formData').mockResolvedValue(formData as any);

			await expect(POST({ request } as any)).rejects.toThrow();
		});

		it('should handle empty CSV data', async () => {
			mockNeatCsv.mockResolvedValue([]);

			const csvContent = `MonitoringLocationID,CharacteristicName,ResultValue`;
			
			const csvFile = new MockFile([csvContent], 'test.csv', { type: 'text/csv' });
			const formData = new MockFormData();
			formData.append('csvFile', csvFile);

			const request = new Request('http://localhost/api/process-csv', {
				method: 'POST',
				headers: { 'content-type': 'multipart/form-data' },
				body: formData as any
			});

			vi.spyOn(request, 'formData').mockResolvedValue(formData as any);

			await expect(POST({ request } as any)).rejects.toThrow();
		});

		it('should handle CSV with no temperature data', async () => {
			const mockCsvData = [
				{
					monitoringlocationid: 'LOC001',
					characteristicname: 'pH',
					resultvalue: '7.5'
				},
				{
					monitoringlocationid: 'LOC002',
					characteristicname: 'Dissolved Oxygen',
					resultvalue: '8.2'
				}
			];

			mockNeatCsv.mockResolvedValue(mockCsvData);

			const csvContent = `MonitoringLocationID,CharacteristicName,ResultValue
LOC001,pH,7.5
LOC002,Dissolved Oxygen,8.2`;
			
			const csvFile = new MockFile([csvContent], 'test.csv', { type: 'text/csv' });
			const formData = new MockFormData();
			formData.append('csvFile', csvFile);

			const request = new Request('http://localhost/api/process-csv', {
				method: 'POST',
				headers: { 'content-type': 'multipart/form-data' },
				body: formData as any
			});

			vi.spyOn(request, 'formData').mockResolvedValue(formData as any);

			await expect(POST({ request } as any)).rejects.toThrow();
		});

	});

	describe('Error Handling', () => {
		it('should handle FormData parsing errors', async () => {
			const request = new Request('http://localhost/api/process-csv', {
				method: 'POST',
				headers: { 'content-type': 'multipart/form-data' },
				body: 'invalid-body' as any
			});

			vi.spyOn(request, 'formData').mockRejectedValue(new Error('FormData parsing failed'));

			await expect(POST({ request } as any)).rejects.toThrow();
			expect(mockError).toHaveBeenCalledWith(400, { message: ERROR_MESSAGES.INVALID_REQUEST });
		});

		it('should handle file reading errors', async () => {
			const csvFile = new MockFile(['content'], 'test.csv', { type: 'text/csv' });
			vi.spyOn(csvFile, 'text').mockRejectedValue(new Error('File read error'));
			
			const formData = new MockFormData();
			formData.append('csvFile', csvFile);

			const request = new Request('http://localhost/api/process-csv', {
				method: 'POST',
				headers: { 'content-type': 'multipart/form-data' },
				body: formData as any
			});

			vi.spyOn(request, 'formData').mockResolvedValue(formData as any);

			await expect(POST({ request } as any)).rejects.toThrow();
			expect(mockError).toHaveBeenCalledWith(400, { message: ERROR_MESSAGES.FILE_READ_ERROR });
		});

		it('should handle neat-csv parsing errors', async () => {
			mockNeatCsv.mockRejectedValue(new Error('CSV parsing failed'));

			const csvContent = `MonitoringLocationID,CharacteristicName,ResultValue
LOC001,Temperature water,20.5`;
			
			const csvFile = new MockFile([csvContent], 'test.csv', { type: 'text/csv' });
			const formData = new MockFormData();
			formData.append('csvFile', csvFile);

			const request = new Request('http://localhost/api/process-csv', {
				method: 'POST',
				headers: { 'content-type': 'multipart/form-data' },
				body: formData as any
			});

			vi.spyOn(request, 'formData').mockResolvedValue(formData as any);

			await expect(POST({ request } as any)).rejects.toThrow();
		});
	});

});
