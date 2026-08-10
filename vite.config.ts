import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { transformSync } from 'esbuild';

export default defineConfig(() => {
  return {
    plugins: [
      {
        name: 'vidstack-jsx-loader',
        transform(code, id) {
          if (id.includes('@vidstack/react') && id.endsWith('.js')) {
            const result = transformSync(code, {
              loader: 'jsx',
              jsx: 'automatic',
              sourcemap: false,
            });
            return {
              code: result.code,
              map: null,
            };
          }
        },
      },
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      allowedHosts: ['egenetwork11.com', 'www.egenetwork11.com'],
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
