import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// The browser calls /api on this server, which forwards to the generated API, so the API needs no CORS.
export default defineConfig(({ mode }) => {
  const { API_URL = 'http://localhost:3000' } = loadEnv(mode, process.cwd(), '');
  const proxy = { '/api': { target: API_URL, rewrite: (path) => path.replace(/^\/api/, '') } };

  return { plugins: [react(), tailwindcss()], server: { proxy }, preview: { proxy } };
});
