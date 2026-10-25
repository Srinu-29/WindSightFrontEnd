import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  // Load settings for the current mode (development/production). Empty prefix
  // allows this server-side config to read API_PROXY_TARGET without VITE_.
  const env = loadEnv(mode, process.cwd(), '');
  // Browser calls /api/health; Vite forwards it to FastAPI on port 8000.
  // The browser sees one origin, so this setup does not need cross-origin CORS.
  const proxy = { '/api': { target: env.API_PROXY_TARGET || 'http://127.0.0.1:8000', changeOrigin: true } };
  // React compiles JSX; Tailwind builds CSS utilities. strictPort prevents Vite
  // silently choosing another port. Preview serves an already-built frontend;
  // a deployed static site needs its own proxy (see nginx.conf).
  return { plugins: [react(), tailwindcss()], server: { port: 5173, strictPort: true, proxy }, preview: { port: 4173, proxy } };
});
