
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 必须使用空字符串或 './'，以确保在 TCB 的任何子路径下资源都能正确加载
  base: '', 
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    'process.env.SUPABASE_URL': JSON.stringify(process.env.SUPABASE_URL),
    'process.env.SUPABASE_ANON_KEY': JSON.stringify(process.env.SUPABASE_ANON_KEY),
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    target: 'es2015',
    // 确保打包后文件名不带过长哈希，有时 TCB 会有文件路径长度限制
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  }
})
