
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 必须使用 './' 相对路径，否则在腾讯云静态托管中会找不到 CSS 和 JS 
  base: './', 
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    'process.env.SUPABASE_URL': JSON.stringify(process.env.SUPABASE_URL),
    'process.env.SUPABASE_ANON_KEY': JSON.stringify(process.env.SUPABASE_ANON_KEY),
  },
  build: {
    // 确保打包出的文件夹叫 dist
    outDir: 'dist',
    assetsDir: 'assets',
    // 生产环境不生成 map 文件，体积更小，加载更快
    sourcemap: false,
    // 解决一些浏览器兼容性问题
    target: 'es2015'
  }
})
