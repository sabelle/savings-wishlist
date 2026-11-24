import { env } from 'node:process'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': env.BACKEND_URL || 'http://127.0.0.1:3000',
    },
  },
})
