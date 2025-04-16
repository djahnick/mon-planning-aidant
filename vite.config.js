import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'tailwindcss/version.js': fileURLToPath(new URL('./tailwind-version.js', import.meta.url)),
    },
  },
})
