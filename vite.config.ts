
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    base: '', 
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      'process.env.SUPABASE_URL': JSON.stringify(env.SUPABASE_URL),
      'process.env.SUPABASE_ANON_KEY': JSON.stringify(env.SUPABASE_ANON_KEY),
    },
    server: {
      proxy: {
        // 配置代理：将 /aliyun-api 转发到阿里云真实地址
        '/aliyun-api': {
          target: 'https://dashscope.aliyuncs.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/aliyun-api/, '/api/v1')
        }
      }
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      target: 'es2015',
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
    }
  }
})
