
import { createClient } from '@supabase/supabase-js';

// 获取环境变量的辅助函数
const getEnvValue = (name: string, fallback: string): string => {
  // 1. 尝试 Vite 注入
  const v1 = (import.meta as any).env?.[`VITE_${name}`];
  if (v1 && !v1.includes('placeholder')) return v1;
  
  // 2. 尝试 process.env (Vercel define)
  try {
    const v2 = (process.env as any)[name];
    if (v2 && !v2.includes('placeholder')) return v2;
  } catch(e) {}

  return fallback;
};

// 这里的 fallback 地址是你提供的地址，如果 Vercel 没配，就会用这几个
export const SUPABASE_URL = getEnvValue('SUPABASE_URL', 'https://rnxiudmyhqqbyzhzjpqb.supabase.co');
export const SUPABASE_ANON_KEY = getEnvValue('SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJueGl1ZG15aHFxYnl6aHpqcHFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NzIxMjMsImV4cCI6MjA4NTA0ODEyM30.tY2W1uuOFewFUkPFkru3GDjkpmvZJcCkwnGAwCWCBpA');

// 创建客户端
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 验证配置是否基本可用
export const isSupabaseConfigured = () => {
  return SUPABASE_URL.startsWith('https://') && SUPABASE_ANON_KEY.length > 50;
};
