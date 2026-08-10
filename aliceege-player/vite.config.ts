import { defineConfig, transformWithOxc } from 'vite';

const vidstackJsxInJs = () => ({
	name: 'vidstack-jsx-in-js',
	enforce: 'pre' as const,
	transform(code: string, id: string) {
		if (!id.includes('/node_modules/@vidstack/react/') || !id.endsWith('.js')) {
			return null;
		}

		return transformWithOxc(code, id, {
			lang: 'jsx',
			jsx: {
				runtime: 'automatic',
			},
		});
	},
});

export default defineConfig({
	base: './',
	plugins: [vidstackJsxInJs()],
});
