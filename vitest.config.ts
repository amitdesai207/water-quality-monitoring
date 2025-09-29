/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		environment: 'node',
		globals: true,
		include: ['src/**/*.{test,spec}.{js,ts}'],
		exclude: ['**/node_modules/**'],
		coverage: {
			reporter: ['text', 'html'],
			include: ['src/routes/api/**/*'],
			exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts']
		}
	},
	resolve: {
		alias: {
			$lib: '/src/lib'
		}
	}
});
