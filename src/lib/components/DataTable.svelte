<script lang="ts">
	import type { TemperatureDataTableProps, TemperatureTableRow, TemperatureTableState, TemperatureSortField, SortDirection } from '$lib/types';

    const CONTENT_TEXT = {
		SEARCH_LABEL: 'Search',
		LOADING_MESSAGE: 'Loading...',
		PREVIOUS_PAGE: 'Previous',
		NEXT_PAGE: 'Next',
		PAGE_INFO: 'Page {current} of {total}',
		ITEMS_INFO: 'Showing {start} to {end} of {total} items',
		SORT_ASC: 'Sort ascending',
		SORT_DESC: 'Sort descending',
		SORT_NONE: 'Remove sort',
        EMPTY_MESSAGE: 'No data available',
        SEARCH_PLACEHOLDER: 'Search locations...',
		LOCATION_HEADER: 'Monitoring Location',
		TEMPERATURE_HEADER: 'Average Temperature (°C)',
		VISUALIZATION_HEADER: 'Temperature Range'
	};

    	// Sort field constants
	const SORT_FIELDS = {
		LOCATION: 'location',
		TEMPERATURE: 'temperature'
	} as const;

	// Sort direction constants
	const SORT_DIRECTIONS = {
		ASC: 'asc',
		DESC: 'desc'
	} as const;

	let {
		data,
		searchable = true,
		sortable = true,
		paginated = true,
		itemsPerPage = 10,
		loading = false,
		emptyMessage = CONTENT_TEXT.EMPTY_MESSAGE,
		searchPlaceholder = CONTENT_TEXT.SEARCH_PLACEHOLDER,
		onRowClick
	}: TemperatureDataTableProps = $props();

	// Component state
	let state = $state<TemperatureTableState>({
		sortField: SORT_FIELDS.LOCATION,
		sortDirection: SORT_DIRECTIONS.ASC,
		searchTerm: '',
		currentPage: 1
	});

	// Temperature-specific constants
	const TEMPERATURE_RANGES = {
		COLD_THRESHOLD: 10,
		WARM_THRESHOLD: 25,
	};

	/**
	 * Filters temperature data based on search term (searches location names)
	 * 
	 * @param {TemperatureTableRow[]} data - Array of temperature data rows to filter
	 * @param {string} searchTerm - Search term to filter by (case-insensitive)
	 * @returns {TemperatureTableRow[]} Filtered array containing only rows with matching location names
	 */
	function filterData(data: TemperatureTableRow[], searchTerm: string): TemperatureTableRow[] {
		if (!searchTerm.trim()) return data;

		const lowerSearchTerm = searchTerm.toLowerCase();
		return data.filter(row => 
			row.location.toLowerCase().includes(lowerSearchTerm)
		);
	}

	/**
	 * Sorts temperature data by specified field and direction
	 * 
	 * @param {TemperatureTableRow[]} data - Array of temperature data rows to sort
	 * @param {TemperatureSortField} sortField - Field to sort by ('location' or 'temperature')
	 * @param {SortDirection} sortDirection - Sort direction ('asc', 'desc', or null)
	 * @returns {TemperatureTableRow[]} Sorted array of temperature data rows
	 */
	function sortData(data: TemperatureTableRow[], sortField: TemperatureSortField, sortDirection: SortDirection): TemperatureTableRow[] {
		if (!sortField || !sortDirection) return data;

		return [...data].sort((a, b) => {
			let comparison = 0;
			
			if (sortField === SORT_FIELDS.LOCATION) {
				comparison = a.location.localeCompare(b.location);
			} else if (sortField === SORT_FIELDS.TEMPERATURE) {
				comparison = a.temperature - b.temperature;
			}

			return sortDirection === SORT_DIRECTIONS.DESC ? -comparison : comparison;
		});
	}

	/**
	 * Paginates temperature data array
	 * 
	 * @param {TemperatureTableRow[]} data - Array of temperature data rows to paginate
	 * @param {number} page - Current page number (1-based)
	 * @param {number} itemsPerPage - Number of items to show per page
	 * @returns {TemperatureTableRow[]} Paginated array containing only items for the current page
	 */
	function paginateData(data: TemperatureTableRow[], page: number, itemsPerPage: number): TemperatureTableRow[] {
		if (!paginated) return data;
		
		const startIndex = (page - 1) * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;
		return data.slice(startIndex, endIndex);
	}

	/**
	 * Handles column header click for sorting
	 * Cycles through sort states: none -> asc -> desc -> none
	 * 
	 * @param {TemperatureSortField} field - Field to sort by ('location' or 'temperature')
	 * @returns {void}
	 */
	function handleSort(field: TemperatureSortField) {
		if (!sortable || !field) return;

		const currentField = state.sortField;
		const currentDirection = state.sortDirection;

		if (currentField === field) {
			if (currentDirection === SORT_DIRECTIONS.ASC) {
				state.sortDirection = SORT_DIRECTIONS.DESC;
			} else {
				state.sortDirection = SORT_DIRECTIONS.ASC;
			}
		} else {
			state.sortField = field;
			state.sortDirection = SORT_DIRECTIONS.ASC;
		}

		// Reset to first page when sorting changes
		state.currentPage = 1;
	}

	/**
	 * Handles search input change
	 * Updates search term state and resets pagination to first page
	 * 
	 * @param {Event} event - Input change event from search field
	 * @returns {void}
	 */
	function handleSearch(event: Event) {
		const target = event.target as HTMLInputElement;
		state.searchTerm = target.value;
		state.currentPage = 1;
	}

	/**
	 * Handles page change
	 * Updates the current page state for pagination
	 * 
	 * @param {number} newPage - New page number to navigate to (1-based)
	 * @returns {void}
	 */
	function changePage(newPage: number) {
		state.currentPage = newPage;
	}

	/**
	 * Gets the sort icon for a field
	 * Returns appropriate Unicode arrow character based on current sort state
	 * 
	 * @param {TemperatureSortField} field - Field to get sort icon for
	 * @returns {string} Unicode arrow character ('↑', '↓', or '↕') or empty string
	 */
	function getSortIcon(field: TemperatureSortField): string {
		if (!sortable || !field) return '';
		
		if (state.sortField === field) {
			return state.sortDirection === SORT_DIRECTIONS.ASC ? '↑' : '↓';
		}
		return '↕';
	}

	/**
	 * Formats temperature value with unit
	 * Formats temperature to one decimal place and adds Celsius unit
	 * 
	 * @param {number} temperature - Temperature value in Celsius
	 * @returns {string} Formatted temperature string with unit (e.g., "23.5°C")
	 */
	function formatTemperature(temperature: number): string {
		return `${temperature.toFixed(1)}°C`;
	}

	/**
	 * Gets temperature color class for visualization
	 * Returns Tailwind CSS background color class based on temperature ranges
	 * 
	 * @param {number} temperature - Temperature value in Celsius
	 * @returns {string} Tailwind CSS class ('bg-blue-500', 'bg-yellow-500', or 'bg-red-500')
	 */
	function getTemperatureColor(temperature: number): string {
		if (temperature < TEMPERATURE_RANGES.COLD_THRESHOLD) return 'bg-blue-500';
		if (temperature < TEMPERATURE_RANGES.WARM_THRESHOLD) return 'bg-yellow-500';
		return 'bg-red-500';
	}

	/**
	 * Calculates temperature statistics for visualization
	 * Computes minimum and maximum temperature values from the dataset
	 * 
	 * @param {TemperatureTableRow[]} data - Array of temperature data rows
	 * @returns {{min: number, max: number}} Object containing min and max temperature values
	 */
	function calculateStats(data: TemperatureTableRow[]) {
		if (data.length === 0) return { min: 0, max: 0 };
		
		const temperatures = data.map(row => row.temperature);
		return {
			min: Math.min(...temperatures),
			max: Math.max(...temperatures)
		};
	}

	// Reactive derived values
	let filteredData = $derived(filterData(data, state.searchTerm));
	let sortedData = $derived(sortData(filteredData, state.sortField, state.sortDirection));
	let paginatedData = $derived(paginateData(sortedData, state.currentPage, itemsPerPage));
	let totalPages = $derived(Math.ceil(sortedData.length / itemsPerPage));
	let totalItems = $derived(sortedData.length);
	let startItem = $derived((state.currentPage - 1) * itemsPerPage + 1);
	let endItem = $derived(Math.min(state.currentPage * itemsPerPage, totalItems));
	let stats = $derived(calculateStats(sortedData));
</script>

<div class="datatable-container">
	<!-- Search Bar -->
	{#if searchable}
		<div class="datatable-search mb-4">
			<label for="search" class="sr-only">{CONTENT_TEXT.SEARCH_LABEL}</label>
			<input
				id="search"
				type="text"
				placeholder={searchPlaceholder}
				value={state.searchTerm}
				oninput={handleSearch}
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
			/>
		</div>
	{/if}

	<!-- Table -->
	<div class="datatable-wrapper overflow-x-auto shadow-sm border border-gray-200 rounded-lg">
		<table class="min-w-full divide-y divide-gray-200">
			<!-- Table Header -->
			<thead class="bg-gray-50">
				<tr>
					<!-- Location Column -->
					<th
						scope="col"
						class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
						onclick={() => handleSort(SORT_FIELDS.LOCATION)}
						title={sortable ? 
							state.sortField === SORT_FIELDS.LOCATION && state.sortDirection === SORT_DIRECTIONS.ASC ? CONTENT_TEXT.SORT_DESC :
							state.sortField === SORT_FIELDS.LOCATION && state.sortDirection === SORT_DIRECTIONS.DESC ? CONTENT_TEXT.SORT_NONE :
							CONTENT_TEXT.SORT_ASC : ''}
					>
						<div class="flex items-center justify-between">
							<span>{CONTENT_TEXT.LOCATION_HEADER}</span>
							{#if sortable}
								<span class="ml-2 text-gray-400" aria-hidden="true">
									{getSortIcon(SORT_FIELDS.LOCATION)}
								</span>
							{/if}
						</div>
					</th>
					
					<!-- Temperature Column -->
					<th
						scope="col"
						class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
						onclick={() => handleSort(SORT_FIELDS.TEMPERATURE)}
						title={sortable ? 
							state.sortField === SORT_FIELDS.TEMPERATURE && state.sortDirection === SORT_DIRECTIONS.ASC ? CONTENT_TEXT.SORT_DESC :
							state.sortField === SORT_FIELDS.TEMPERATURE && state.sortDirection === SORT_DIRECTIONS.DESC ? CONTENT_TEXT.SORT_NONE :
							CONTENT_TEXT.SORT_ASC : ''}
					>
						<div class="flex items-center justify-between">
							<span>{CONTENT_TEXT.TEMPERATURE_HEADER}</span>
							{#if sortable}
								<span class="ml-2 text-gray-400" aria-hidden="true">
									{getSortIcon(SORT_FIELDS.TEMPERATURE)}
								</span>
							{/if}
						</div>
					</th>
					
					<!-- Visualization Column -->
					<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
						{CONTENT_TEXT.VISUALIZATION_HEADER}
					</th>
				</tr>
			</thead>

			<!-- Table Body -->
			<tbody class="bg-white divide-y divide-gray-200">
				{#if loading}
					<tr>
						<td 
							colspan="3" 
							class="px-6 py-12 text-center text-gray-500"
						>
							<div class="flex items-center justify-center">
								<div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-3"></div>
								{CONTENT_TEXT.LOADING_MESSAGE}
							</div>
						</td>
					</tr>
				{:else if paginatedData.length === 0}
					<tr>
						<td 
							colspan="3" 
							class="px-6 py-12 text-center text-gray-500"
						>
							{emptyMessage}
						</td>
					</tr>
				{:else}
					{#each paginatedData as row, index}
						<tr 
							class="hover:bg-gray-50 transition-colors duration-150"
							class:cursor-pointer={onRowClick}
							onclick={() => onRowClick?.(row, index)}
						>
							<!-- Location Cell -->
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="text-sm font-medium text-gray-900">{row.location}</div>
							</td>
							
							<!-- Temperature Cell -->
							<td class="px-6 py-4 whitespace-nowrap">
								<span class="text-sm font-medium text-gray-900">
									{formatTemperature(row.temperature)}
								</span>
							</td>
							
							<!-- Visualization Cell -->
							<td class="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
								<div class="flex items-center">
									<div class="w-20 bg-gray-200 rounded-full h-2">
										<div 
											class="h-2 rounded-full {getTemperatureColor(row.temperature)}"
											style="width: {stats.max > stats.min ? ((row.temperature - stats.min) / (stats.max - stats.min)) * 100 : 0}%"
										></div>
									</div>
									<span class="ml-2 text-xs text-gray-500">
										{stats.max > stats.min ? ((row.temperature - stats.min) / (stats.max - stats.min) * 100).toFixed(0) : 0}%
									</span>
								</div>
							</td>
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>

	<!-- Pagination -->
	{#if paginated && totalPages > 1}
		<div class="datatable-pagination mt-4 flex items-center justify-between">
			<!-- Items Info -->
			<div class="text-sm text-gray-700">
				{CONTENT_TEXT.ITEMS_INFO
					.replace('{start}', startItem.toString())
					.replace('{end}', endItem.toString())
					.replace('{total}', totalItems.toString())}
			</div>

			<!-- Page Controls -->
			<div class="flex items-center space-x-2">
				<!-- Previous Button -->
				<button
					type="button"
					disabled={state.currentPage <= 1}
					onclick={() => changePage(state.currentPage - 1)}
					class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{CONTENT_TEXT.PREVIOUS_PAGE}
				</button>

				<!-- Page Numbers -->
				{#each Array.from({ length: totalPages }, (_, i) => i + 1) as page}
					{#if page === 1 || page === totalPages || (page >= state.currentPage - 2 && page <= state.currentPage + 2)}
						<button
							type="button"
							onclick={() => changePage(page)}
							class="px-3 py-2 text-sm font-medium rounded-md"
							class:bg-blue-600={page === state.currentPage}
							class:text-white={page === state.currentPage}
							class:text-gray-500={page !== state.currentPage}
							class:bg-white={page !== state.currentPage}
							class:border={page !== state.currentPage}
							class:border-gray-300={page !== state.currentPage}
							class:hover:bg-gray-50={page !== state.currentPage}
						>
							{page}
						</button>
					{:else if page === state.currentPage - 3 || page === state.currentPage + 3}
						<span class="px-3 py-2 text-sm text-gray-500">...</span>
					{/if}
				{/each}

				<!-- Next Button -->
				<button
					type="button"
					disabled={state.currentPage >= totalPages}
					onclick={() => changePage(state.currentPage + 1)}
					class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{CONTENT_TEXT.NEXT_PAGE}
				</button>
			</div>
		</div>
	{/if}
</div>

