<script lang="ts">
	import type { ResultsDisplayProps, TemperatureData } from '$lib/types';

	let { results }: ResultsDisplayProps = $props();

	let sortField = $state<'location' | 'temperature'>('location');
	let sortDirection = $state<'asc' | 'desc'>('asc');
	let searchTerm = $state('');

	let filteredResults = $derived(filterResults(searchTerm, results));
	let sortedResults = $derived(sortResults(filteredResults, sortField, sortDirection));
	let totalLocations = $derived(Object.keys(results).length);
	let values = $derived(Object.values(results));
	let stats = $derived(calculateStats(values));

	// Constants for page content and labels
	const CONTENT = {
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
	 * Validates search term and filters results
	 * Filters temperature data based on location name matching the search term
	 * 
	 * @param {string} term - Search term to validate and use for filtering
	 * @param {TemperatureData} data - Results data to filter
	 * @returns {[string, number][]} Filtered results array
	 */
	function filterResults(term: string, data: TemperatureData): [string, number][] {
		const cleanTerm = term.trim().toLowerCase();
		return Object.entries(data).filter(([location]) => 
			location.toLowerCase().includes(cleanTerm)
		);
	}

	/**
	 * Sorts results based on field and direction
	 * Sorts the filtered results array by location or temperature in ascending or descending order
	 * 
	 * @param {[string, number][]} data - Filtered results to sort
	 * @param {'location' | 'temperature'} field - Field to sort by
	 * @param {'asc' | 'desc'} direction - Sort direction
	 * @returns {[string, number][]} Sorted results array
	 */
	function sortResults(
		data: [string, number][], 
		field: 'location' | 'temperature', 
		direction: 'asc' | 'desc'
	): [string, number][] {
		return [...data].sort(([aLocation, aTemp], [bLocation, bTemp]) => {
			let comparison = 0;
			if (field === 'location') {
				comparison = aLocation.localeCompare(bLocation);
			} else {
				comparison = aTemp - bTemp;
			}
			return direction === 'asc' ? comparison : -comparison;
		});
	}

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

	/**
	 * Toggles sort direction for the specified field
	 * Changes sort direction or switches to new field for sorting
	 * 
	 * @param {'location' | 'temperature'} field - The field to sort by ('location' or 'temperature')
	 * @returns {void}
	 */
	function toggleSort(field: 'location' | 'temperature') {
		if (sortField === field) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortField = field;
			sortDirection = 'asc';
		}
	}

</script>

<div class="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
	<!-- Header -->
	<div class="px-6 py-4 border-b border-gray-200">
		<h2 class="text-xl font-semibold text-gray-900">{CONTENT.RESULTS_TITLE}</h2>
		<p class="text-sm text-gray-600 mt-1">
			{CONTENT.FOUND_DATA_MESSAGE(totalLocations)}
		</p>
	</div>

	<!-- Statistics Cards -->
	<div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
		<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
			<div class="bg-white p-4 rounded-lg border">
				<div class="text-sm font-medium text-gray-500">{CONTENT.TOTAL_LOCATIONS}</div>
				<div class="text-2xl font-bold text-gray-900">{totalLocations}</div>
			</div>
			<div class="bg-white p-4 rounded-lg border">
				<div class="text-sm font-medium text-gray-500">{CONTENT.AVERAGE_TEMPERATURE}</div>
				<div class="text-2xl font-bold text-blue-600">{stats.average.toFixed(1)}{CONTENT.TEMPERATURE_UNIT}</div>
			</div>
			<div class="bg-white p-4 rounded-lg border">
				<div class="text-sm font-medium text-gray-500">{CONTENT.MIN_TEMPERATURE}</div>
				<div class="text-2xl font-bold text-green-600">{stats.min.toFixed(1)}{CONTENT.TEMPERATURE_UNIT}</div>
			</div>
			<div class="bg-white p-4 rounded-lg border">
				<div class="text-sm font-medium text-gray-500">{CONTENT.MAX_TEMPERATURE}</div>
				<div class="text-2xl font-bold text-red-600">{stats.max.toFixed(1)}{CONTENT.TEMPERATURE_UNIT}</div>
			</div>
		</div>
	</div>


	<!-- Controls -->
	<div class="px-6 py-4 border-b border-gray-200">
		<div class="relative">
			<input
				type="text"
				placeholder={CONTENT.SEARCH_PLACEHOLDER}
				bind:value={searchTerm}
				class="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
			/>
			<svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
			</svg>
		</div>
	</div>

	<!-- Temperature Legend -->
	<div class="px-6 py-3 bg-gray-50 border-b border-gray-200">
		<div class="flex items-center space-x-6 text-sm">
			<span class="text-gray-600 font-medium">{CONTENT.LEGEND_TITLE}</span>
			<div class="flex items-center space-x-2">
				<div class="w-3 h-3 bg-blue-500 rounded-full"></div>
				<span class="text-gray-600">{CONTENT.LEGEND_COLD} (&lt; {TEMPERATURE_RANGES.COLD_THRESHOLD}°C)</span>
			</div>
			<div class="flex items-center space-x-2">
				<div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
				<span class="text-gray-600">{CONTENT.LEGEND_MODERATE} ({TEMPERATURE_RANGES.COLD_THRESHOLD}-{TEMPERATURE_RANGES.WARM_THRESHOLD}°C)</span>
			</div>
			<div class="flex items-center space-x-2">
				<div class="w-3 h-3 bg-red-500 rounded-full"></div>
				<span class="text-gray-600">{CONTENT.LEGEND_WARM} (&gt; {TEMPERATURE_RANGES.WARM_THRESHOLD}°C)</span>
			</div>
		</div>
	</div>

	<!-- Results Table -->
	<div class="overflow-x-auto">
		<table class="min-w-full divide-y divide-gray-200">
			<thead class="bg-gray-50">
				<tr>
					<th
						class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
						onclick={() => toggleSort('location')}
					>
						<div class="flex items-center space-x-1">
							<span>{CONTENT.LOCATION_HEADER}</span>
							{#if sortField === 'location'}
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									{#if sortDirection === 'asc'}
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
									{:else}
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
									{/if}
								</svg>
							{/if}
						</div>
					</th>
					<th
						class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
						onclick={() => toggleSort('temperature')}
					>
						<div class="flex items-center space-x-1">
							<span>{CONTENT.TEMPERATURE_HEADER}</span>
							{#if sortField === 'temperature'}
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									{#if sortDirection === 'asc'}
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
									{:else}
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
									{/if}
								</svg>
							{/if}
						</div>
					</th>
					<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
						{CONTENT.VISUALIZATION_HEADER}
					</th>
				</tr>
			</thead>
			<tbody class="bg-white divide-y divide-gray-200">
				{#each sortedResults as [location, temperature]}
					<tr class="hover:bg-gray-50">
						<td class="px-6 py-4 whitespace-nowrap">
							<div class="text-sm font-medium text-gray-900">{location}</div>
						</td>
						<td class="px-6 py-4 whitespace-nowrap">
							<span class="text-sm font-medium text-gray-900">
								{temperature.toFixed(1)}{CONTENT.TEMPERATURE_UNIT}
							</span>
						</td>
						<td class="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
							<div class="flex items-center">
								<div class="w-20 bg-gray-200 rounded-full h-2">
									<div 
										class="h-2 rounded-full {
											temperature < TEMPERATURE_RANGES.COLD_THRESHOLD ? 'bg-blue-500' :
											temperature < TEMPERATURE_RANGES.WARM_THRESHOLD ? 'bg-yellow-500' :
											'bg-red-500'
										}"
										style="width: {((temperature - stats.min) / (stats.max - stats.min)) * 100}%"
									></div>
								</div>
								<span class="ml-2 text-xs text-gray-500">
									{((temperature - stats.min) / (stats.max - stats.min) * 100).toFixed(0)}{CONTENT.PERCENTAGE_SUFFIX}
								</span>
							</div>
						</td>
					</tr>
				{:else}
					<tr>
						<td colspan="3" class="px-6 py-4 text-center text-sm text-gray-500">
							{CONTENT.NO_RESULTS}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>