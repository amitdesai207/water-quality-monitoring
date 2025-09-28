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

	const STYLES = {
		CONTAINER_BASE: 'bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-200',
		WRAPPER: 'flex items-center space-x-3',
		COMPANY_NAME: 'text-lg font-semibold text-gray-900',
		TAGLINE: 'text-sm text-gray-500'
	};
</script>

<div class={STYLES.WRAPPER}>
	<div class="{SIZE_CLASSES.CONTAINER[size]} {STYLES.CONTAINER_BASE}">
		<img 
			src={LOGO_CONFIG.IMAGE_PATH} 
			alt={CONTENT_TEXT.ALT_TEXT} 
			class={SIZE_CLASSES.IMAGE[size]} 
		/>
	</div>
	{#if showText}
		<div>
			<h1 class={STYLES.COMPANY_NAME}>{companyName}</h1>
			<p class={STYLES.TAGLINE}>{tagline}</p>
		</div>
	{/if}
</div>