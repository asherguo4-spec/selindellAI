
import { createClient } from '@supabase/supabase-js';

/**
 * 修复版：环境变量获取
 * 解决 atob() 报错的关键：不要对包含非 Base64 字符的串进行强行解密
 */
const getSafeEnv = (name: string, fallback: string): string => {
  let val = (import.meta as any).env?.[`VITE_${name}`] || (process.env as any)[name];
  
  if (!val || val.includes('{{') || val.includes('placeholder')) {
    return fallback;
  }

  // 关键：Supabase Key 的 JWT 部分必须是 Base64，且包含 "."
  // 我们只清理两端的不可见字符，不清理中间，因为 JWT 可能包含特殊 Base64 符号
  const trimmed = val.trim();
  
  // 如果发现明显的中文字符，直接用 fallback
  if (/[\u4e00-\u9fa5]/.test(trimmed)) {
    console.error(`检测到 ${name} 包含中文字符，已自动忽略。请检查环境变量配置。`);
    return fallback;
  }

  return trimmed;
};

export const SUPABASE_URL = getSafeEnv('SUPABASE_URL', 'https://rnxiudmyhqqbyzhzjpqb.supabase.co');
export const SUPABASE_ANON_KEY = getSafeEnv('SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJueGl1ZG15aHFxYnl6aHpqcHFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NzIxMjMsImV4cCI6MjA4NTA0ODEyM30.tY2W1uuOFewFUkPFkru3GDjkpmvZJcCkwnGAwCWCBpA');

export const supabase = (() => {
  try {
    // 只有合法的 JWT 格式才初始化
    if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.split('.').length !== 3) {
      throw new Error("Key 格式不合法");
    }
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (e) {
    console.warn("Supabase 配置不可用，进入本地模式。");
    return {
      from: () => ({
        select: () => ({ eq: () => ({ order: () => Promise.resolve({ data: [], error: null }), single: () => Promise.resolve({ data: null, error: null }) }) }),
        upsert: () => Promise.resolve({ error: null }),
        insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
        delete: () => ({ eq: () => Promise.resolve({ error: null }) })
      })
    } as any;
  }
})();

export const isSupabaseConfigured = () => SUPABASE_ANON_KEY.length > 50;

// Added logAction to record user activities in Supabase or handle failures gracefully.
export const logAction = async (userId: string, action: string, details?: any) => {
  try {
    await supabase.from('logs').insert([{
      user_id: userId,
      action,
      details,
      created_at: new Date().toISOString()
    }]);
  } catch (e) {
    console.debug('Log action skipped', e);
  }
};
