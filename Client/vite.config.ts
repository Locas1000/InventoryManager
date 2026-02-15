import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Intercept any request that starts with /api
      '/api': {
        target: 'http://localhost:5164',
        changeOrigin: true,
        secure: false // Set to false so Vite doesn't complain about local SSL certs
      }
    }
  }
})
