import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Raise the warning threshold so big lazy chunks don't generate noise
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // MUI core – shared by everything
          'vendor-mui': ['@mui/material', '@mui/icons-material', '@mui/system'],
          // React + router
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Heavy optional libs
          'vendor-motion': ['framer-motion'],
          'vendor-qr': ['html5-qrcode'],
          // DOMPurify (used in Reports / rich text)
          'vendor-dompurify': ['dompurify'],
        },
      },
    },
  },
})
