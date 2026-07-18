import { defineConfig, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

// https://vite.dev/config/
export default defineConfig(async () => {
  const plugins: PluginOption[] = [
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
  ];

  if (process.env.VISUALIZE) {
    const { visualizer } = await import('rollup-plugin-visualizer');
    plugins.push(visualizer({ open: true, gzipSize: true, brotliSize: true }));
  }

  return {
    base: '/',
    plugins,
    server: {
      proxy: {
        '/api': 'http://localhost:3001',
      }
    },
    build: {
      sourcemap: false,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            socket: ['socket.io-client'],
            motion: ['framer-motion'],
            icons: ['lucide-react'],
            date: ['date-fns'],
            query: ['@tanstack/react-query'],
            charts: ['recharts'],
          }
        }
      }
    }
  };
})

