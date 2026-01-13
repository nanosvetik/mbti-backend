import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Важно: разрешаем внешние подключения
    port: 5173,      // Фиксируем порт
    strictPort: true,
    watch: {
      usePolling: true, // Чтобы изменения в коде подхватывались сразу
    },
  },
})