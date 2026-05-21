import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    ViteImageOptimizer({
      jpg: { quality: 80, mozjpeg: true },
      png: { quality: 80, palette: true },
      webp: { quality: 80 },
      avif: { quality: 65 },
      includePublic: true,
      logStats: true,
    }),
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['lucide-react', 'framer-motion'],
          query: ['@tanstack/react-query'],
        }
      }
    }
  }
})

