<script lang="ts">
	import type { ResultsDisplayProps, TemperatureData, TemperatureTableRow } from '$lib/types';
	import DataTable from './DataTable.svelte';

	let { results }: ResultsDisplayProps = $props();

	let totalLocations = $derived(Object.keys(results).length);
	let values = $derived(Object.values(results));
	let stats = $derived(calculateStats(values));

	// Convert TemperatureData to array format for DataTable
	let tableData = $derived(convertToTableData(results));

	/**
	 * Converts TemperatureData object to array of TemperatureTableRow for DataTable
	 * 
	 * @param {TemperatureData} data - Temperature data object
	 * @returns {TemperatureTableRow[]} Array of table rows
	 */
	function convertToTableData(data: TemperatureData): TemperatureTableRow[] {
		return Object.entries(data).map(([location, temperature]) => ({
			location,
			temperature
		}));
	}

	// Content text constants
	const CONTENT_TEXT = {
		RESULTS_TITLE: 'Temperature Analysis Results',
		SEARCH_PLACEHOLDER: 'Search locations...',
		LOCATION_HEADER: 'Monitoring Location',
		TEMPERATURE_HEADER: 'Average Temperature (°C)',
		VISUALIZATION_HEADER: 'Temperature Range',
		TOTAL_LOCATIONS: 'Total Locations',
		AVERAGE_TEMPERATURE: 'Average Temperature',
		MIN_TEMPERATURE: 'Minimum Temperature',
		MAX_TEMPERATURE: 'Maximum Temperature',
		NO_RESULTS: 'No locations match your search.',
		TEMPERATURE_UNIT: '°C',
		LEGEND_TITLE: 'Temperature Range:',
		LEGEND_COLD: 'Cold',
		LEGEND_MODERATE: 'Moderate',
		LEGEND_WARM: 'Warm',
		PERCENTAGE_SUFFIX: '%',
		FOUND_DATA_MESSAGE: (total: number) => `Found temperature data for ${total} monitoring locations`
	};

	const TEMPERATURE_RANGES = {
		COLD_THRESHOLD: 10,
		WARM_THRESHOLD: 25,
	};



	/**
	 * Calculates temperature statistics
	 * Computes average, minimum, and maximum values from temperature data
	 * 
	 * @param {number[]} values - Array of temperature values
	 * @returns {{average: number, min: number, max: number}} Statistics object with average, min, max
	 */
	function calculateStats(values: number[]) {
		if (values.length === 0) {
			return { average: 0, min: 0, max: 0 };
		}
		
		return {
			average: values.reduce((sum, temp) => sum + temp, 0) / values.length,
			min: Math.min(...values),
			max: Math.max(...values)
		};
	}	


</script>

<div class="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
	<!-- Header -->
	<div class="px-6 py-4 border-b border-gray-200">
		<h2 class="text-xl font-semibold text-gray-900">{CONTENT_TEXT.RESULTS_TITLE}</h2>
		<p class="text-sm text-gray-600 mt-1">
			{CONTENT_TEXT.FOUND_DATA_MESSAGE(totalLocations)}
		</p>
	</div>

	<!-- Statistics Cards -->
	<div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
		<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
			<div class="bg-white p-4 rounded-lg border">
				<div class="text-sm font-medium text-gray-500">{CONTENT_TEXT.TOTAL_LOCATIONS}</div>
				<div class="text-2xl font-bold text-gray-900">{totalLocations}</div>
			</div>
			<div class="bg-white p-4 rounded-lg border">
				<div class="text-sm font-medium text-gray-500">{CONTENT_TEXT.AVERAGE_TEMPERATURE}</div>
				<div class="text-2xl font-bold text-blue-600">{stats.average.toFixed(1)}{CONTENT_TEXT.TEMPERATURE_UNIT}</div>
			</div>
			<div class="bg-white p-4 rounded-lg border">
				<div class="text-sm font-medium text-gray-500">{CONTENT_TEXT.MIN_TEMPERATURE}</div>
				<div class="text-2xl font-bold text-green-600">{stats.min.toFixed(1)}{CONTENT_TEXT.TEMPERATURE_UNIT}</div>
			</div>
			<div class="bg-white p-4 rounded-lg border">
				<div class="text-sm font-medium text-gray-500">{CONTENT_TEXT.MAX_TEMPERATURE}</div>
				<div class="text-2xl font-bold text-red-600">{stats.max.toFixed(1)}{CONTENT_TEXT.TEMPERATURE_UNIT}</div>
			</div>
		</div>
	</div>


	<!-- Temperature Legend -->
	<div class="px-6 py-3 bg-gray-50 border-b border-gray-200">
		<div class="flex items-center space-x-6 text-sm">
			<span class="text-gray-600 font-medium">{CONTENT_TEXT.LEGEND_TITLE}</span>
			<div class="flex items-center space-x-2">
				<div class="w-3 h-3 bg-blue-500 rounded-full"></div>
				<span class="text-gray-600">{CONTENT_TEXT.LEGEND_COLD} (&lt; {TEMPERATURE_RANGES.COLD_THRESHOLD}°C)</span>
			</div>
			<div class="flex items-center space-x-2">
				<div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
				<span class="text-gray-600">{CONTENT_TEXT.LEGEND_MODERATE} ({TEMPERATURE_RANGES.COLD_THRESHOLD}-{TEMPERATURE_RANGES.WARM_THRESHOLD}°C)</span>
			</div>
			<div class="flex items-center space-x-2">
				<div class="w-3 h-3 bg-red-500 rounded-full"></div>
				<span class="text-gray-600">{CONTENT_TEXT.LEGEND_WARM} (&gt; {TEMPERATURE_RANGES.WARM_THRESHOLD}°C)</span>
			</div>
		</div>
	</div>

	<!-- DataTable -->
	<div class="px-6 py-4">
		<DataTable 
			data={tableData}
			searchable={true}
			sortable={true}
			paginated={true}
			itemsPerPage={10}
			searchPlaceholder={CONTENT_TEXT.SEARCH_PLACEHOLDER}
			emptyMessage={CONTENT_TEXT.NO_RESULTS}
		/>
	</div>
</div>