
import { createClient } from '@supabase/supabase-js';

const getSafeEnv = (name: string, fallback: string): string => {
  let val: string | null = null;
  
  // 1. 尝试从 Vite 环境读取
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      val = (import.meta as any).env[`VITE_${name}`];
    }
  } catch (e) {}

  // 2. 尝试从 process 读取 (已在 index.html shim)
  try {
    if (!val && typeof process !== 'undefined' && process.env) {
      val = (process.env as any)[name];
    }
  } catch (e) {}
  
  if (!val || typeof val !== 'string' || val.includes('{{') || val.includes('placeholder')) {
    return fallback;
  }

  return val.trim();
};

export const SUPABASE_URL = getSafeEnv('SUPABASE_URL', 'https://rnxiudmyhqqbyzhzjpqb.supabase.co');
export const SUPABASE_ANON_KEY = getSafeEnv('SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJueGl1ZG15aHFxYnl6aHpqcHFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NzIxMjMsImV4cCI6MjA4NTA0ODEyM30.tY2W1uuOFewFUkPFkru3GDjkpmvZJcCkwnGAwCWCBpA');

const createSupabaseFallback = () => {
  const dummyPromise = () => Promise.resolve({ data: null, error: null });
  const dummyChain = () => ({
    select: () => ({ 
      eq: () => ({ 
        order: () => Promise.resolve({ data: [], error: null }), 
        single: dummyPromise 
      }),
      single: dummyPromise
    }),
    upsert: dummyPromise,
    insert: () => ({ select: () => ({ single: dummyPromise }) }),
    delete: () => ({ eq: dummyPromise })
  });

  return {
    from: dummyChain,
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signOut: () => Promise.resolve(),
      signInWithPassword: dummyPromise,
      signUp: dummyPromise
    }
  } as any;
};

export const supabase = (() => {
  try {
    if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.split('.').length !== 3) {
      return createSupabaseFallback();
    }
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (e) {
    return createSupabaseFallback();
  }
})();

export const isSupabaseConfigured = () => SUPABASE_ANON_KEY.length > 50;

export const logAction = async (userId: string, action: string, details?: any) => {
  try {
    await supabase.from('logs').insert([{
      user_id: userId,
      action,
      details,
      created_at: new Date().toISOString()
    }]);
  } catch (e) {}
};
