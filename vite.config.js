import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    base: '/myJOBbuddyUI/',
    plugins: [react()],
    server: {
      proxy: {
        '/chat': {
          target: 'http://localhost:8000',
          changeOrigin: true,
        },
        '/parse': {
          target: env.VITE_API_URL,
          changeOrigin: true,
        },
      },
    },
  }
})
