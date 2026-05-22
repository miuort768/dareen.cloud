import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
    plugins: [
    react({
        // Don't let react-refresh pollute production chunks
        include: /\.(ts|tsx)$/,
        babel: {
            plugins: []
        }
    }),
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
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'socket.io-client'],
          ui: ['lucide-react', 'framer-motion'],
          query: ['@tanstack/react-query'],
          charts: ['recharts'],
          classroom: ['@livekit/components-react', 'livekit-client'],
        }
      }
    }
  }
})

