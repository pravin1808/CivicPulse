import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        // Some read endpoints currently return their JSON payload with 302
        // (Found). A browser treats 302 as a redirect, not as a successful
        // API response, which prevents Axios from receiving the payload.
        // Keep the response body but expose it to the frontend as 200.
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            if (proxyRes.statusCode === 302) {
              proxyRes.statusCode = 200
            }
          })
        },
      },
      '/images': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
