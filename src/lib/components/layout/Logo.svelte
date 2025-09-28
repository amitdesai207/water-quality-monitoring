<script lang="ts">
	interface Props {
		size?: 'sm' | 'md' | 'lg';
		showText?: boolean;
		companyName?: string;
		tagline?: string;
	}

	// Content text constants
	const CONTENT_TEXT = {
		DEFAULT_COMPANY: 'AquaLab',
		DEFAULT_TAGLINE: 'Temperature Analysis Tool',
		ALT_TEXT: 'Water Quality Logo'
	};

	// Configuration constants
	const LOGO_CONFIG = {
		IMAGE_PATH: '/logo.svg'
	};

	let { 
		size = 'md',
		showText = true,
		companyName = CONTENT_TEXT.DEFAULT_COMPANY,
		tagline = CONTENT_TEXT.DEFAULT_TAGLINE
	}: Props = $props();

	const SIZE_CLASSES = {
		CONTAINER: {
			sm: 'w-8 h-8',
			md: 'w-10 h-10', 
			lg: 'w-12 h-12'
		},
		IMAGE: {
			sm: 'w-6 h-6',
			md: 'w-8 h-8',
			lg: 'w-10 h-10'
		}
	};
</script>

<div class="custom-bg flex items-center space-x-3">
	<div class="{SIZE_CLASSES.CONTAINER[size]} bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-200">
		<img 
			src={LOGO_CONFIG.IMAGE_PATH} 
			alt={CONTENT_TEXT.ALT_TEXT} 
			class={SIZE_CLASSES.IMAGE[size]} 
		/>
	</div>
	{#if showText}
		<div>
			<h1 class="text-white text-lg font-semibold text-gray-900">{companyName}</h1>
			<p class="text-white text-sm text-gray-500">{tagline}</p>
		</div>
	{/if}
</div>