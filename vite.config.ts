import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import {
  adminAudioUploadProgressPlugin,
  candidateOperationsPlugin,
  mediaAndWritingUiPlugin,
  removeDemoCandidateLoginPlugin,
} from './vitePlugins';
import { studentAccessFixesPlugin } from './vitePlugins.studentAccessFixes';
import { mockTestCatalogPlugin } from './vitePlugins.mockTestCatalog';

export default defineConfig(() => ({
  plugins: [
    removeDemoCandidateLoginPlugin(),
    mediaAndWritingUiPlugin(),
    candidateOperationsPlugin(),
    adminAudioUploadProgressPlugin(),
    react(),
    tailwindcss(),
    studentAccessFixesPlugin(),
    mockTestCatalogPlugin(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
}));
