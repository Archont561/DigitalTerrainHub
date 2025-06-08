/// <reference types="vitest" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
	test: {
    	globals: true,
		dir: "./vitest",
		environment: "happy-dom",
		setupFiles: [
			"./vitest/setup.ts",
		]
	},
});