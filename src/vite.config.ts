import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    host: '0.0.0.0',      // WSL2対応
    port: 3000,
    open: false           // WSL2では自動オープン無効
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
