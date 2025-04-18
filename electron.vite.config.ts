import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwind from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import renderer from 'vite-plugin-electron-renderer';
import tailwindConfig from './tailwind.config.js';
import { resolve } from 'path';

export default defineConfig({
	main: {
		plugins: [externalizeDepsPlugin(), renderer()]
	},
	preload: {
		plugins: [externalizeDepsPlugin(), renderer()]
	},
	renderer: {
		plugins: [svelte(), renderer()],
		css: {
			postcss: {
				plugins: [tailwind(tailwindConfig), autoprefixer]
			}
		},
		resolve: {
			alias: {
				'./lib-cov/fluent-ffmpeg': './lib/fluent-ffmpeg'
			}
		},
		build: {
			rollupOptions: {
				input: {
					index: resolve(__dirname, 'src/renderer/index.html'),
					settings: resolve(__dirname, 'src/renderer/settings.html'),
				}
			}
		}
	}
});
