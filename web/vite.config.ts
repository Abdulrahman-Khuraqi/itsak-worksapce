import path from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// Builds the interface into ../assets/app (app.js + app.css) with fixed names,
// so index.php can load them like any other file. `npm run dev` proxies api.php to the PHP server.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  build: {
    outDir: '../assets/app',
    emptyOutDir: true,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      input: path.resolve(__dirname, 'src/main.tsx'),
      output: {
        entryFileNames: 'app.js',
        chunkFileNames: 'app-[name].js',
        assetFileNames: (info) => (info.names?.[0]?.endsWith('.css') ? 'app.css' : '[name][extname]'),
      },
    },
  },
  server: { proxy: { '/api.php': 'http://localhost:8080' } },
})
