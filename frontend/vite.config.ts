import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    historyApiFallback: true,
    proxy: {
      '/auth': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
      '/pet/': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
      '/character': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
      '/diary': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
      '/world': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:8001',
        changeOrigin: true,
        ws: true,
      },
      '/destiny': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
      '/events': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
      '/notifications': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
      '/game': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
    },
    fs: {
      allow: ['..'],
    },
  }
})