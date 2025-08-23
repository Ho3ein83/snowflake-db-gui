import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr';
import fs from 'fs';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr(),
    {
      name: 'exclude-public-dev-images',
      apply: 'build',
      closeBundle() {
        const file = path.resolve(__dirname, `dist/dev`);
        if (fs.existsSync(file)) {
          fs.rmSync(file, { recursive: true, force: true });
        }
      }
    }
  ],
  build: {
    chunkSizeWarningLimit: 1600,
  }
})
