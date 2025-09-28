<script lang="ts">
	import Header from './Header.svelte';
	import Footer from './Footer.svelte';
	import type { Snippet } from 'svelte';
	
	interface Props {
		title?: string;
		subtitle?: string;
		showLogo?: boolean;
		showSystemInfo?: boolean;
		version?: string;
		maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
		children?: Snippet;
	}

	// Content text constants
	const CONTENT_TEXT = {
		TITLE: "Water Quality Monitoring",
		SUBTITLE: "Upload CSV files to calculate average water temperature by monitoring location.",
		VERSION: "1.0.0"
	};

	let { 
		title = CONTENT_TEXT.TITLE,
		subtitle = CONTENT_TEXT.SUBTITLE,
		showLogo = true,
		showSystemInfo = true,
		version = CONTENT_TEXT.VERSION,
		maxWidth = 'xl',
		children
	}: Props = $props();

	const maxWidthClasses = {
		sm: 'max-w-sm',
		md: 'max-w-2xl',
		lg: 'max-w-4xl',
		xl: 'max-w-6xl',
		'2xl': 'max-w-7xl',
		full: 'max-w-full'
	};
</script>

<div class="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
	<!-- Header -->
	<Header 
		{title}
		{subtitle}
		{showLogo}
	/>

	<!-- Main content -->
	<main class="flex-1 py-8">
		<div class="container mx-auto px-4 {maxWidthClasses[maxWidth]}">
			{@render children?.()}
		</div>
	</main>

	<!-- Footer -->
	<Footer 
		{showSystemInfo}
		{version}
	/>
</div>
