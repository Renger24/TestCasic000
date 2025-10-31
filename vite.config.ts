import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // Vercel будет деплоить из этой директории
    target: 'esnext', // Для поддержки современных возможностей
  },
})