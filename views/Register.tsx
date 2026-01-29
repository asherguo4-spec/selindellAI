
import React, { useState } from 'react';
import { Sparkles, Mail, Lock, Loader2, ArrowRight, User, LogIn, CheckCircle2, ChevronLeft, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase.ts';

interface RegisterProps {
  onRegisterSuccess: (nickname: string) => void;
  onBack: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegisterSuccess, onBack }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorHint, setErrorHint] = useState<string | null>(null);

  const handleSubmit = async () => {
    setErrorHint(null);
    if (!email.trim()) { setErrorHint("请输入邮箱地址"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setErrorHint("请输入有效的邮箱地址"); return; }
    if (!password.trim()) { setErrorHint("请输入账户密码"); return; }
    if (password.length < 6) { setErrorHint("密码长度至少为 6 位"); return; }
    
    setIsSubmitting(true);
    setSuccessMsg(null);
    
    try {
      if (isLoginMode) {
        // 登录逻辑
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });
        if (error) throw error;
        
        // 登录成功后尝试获取昵称
        const { data: profile } = await supabase
          .from('users')
          .select('nickname')
          .eq('id', data.user.id)
          .single();
          
        setSuccessMsg("验证成功，欢迎归来");
        setTimeout(() => {
          onRegisterSuccess(profile?.nickname || '造物主');
        }, 1500);
      } else {
        // 注册逻辑
        if (!nickname.trim()) {
          setErrorHint("造物主需要一个响亮的昵称");
          setIsSubmitting(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
        });
        if (error) throw error;

        if (data.user) {
          // 在 public.users 表中创建对应档案
          const { error: profileError } = await supabase.from('users').upsert({
            id: data.user.id,
            nickname: nickname.trim(),
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${nickname.trim()}`
          });
          if (profileError) throw profileError;
          
          setSuccessMsg("注册成功，开启造物之旅");
          setTimeout(() => {
            onRegisterSuccess(nickname.trim());
          }, 1500);
        }
      }
    } catch (err: any) {
      setErrorHint(err.message === "Invalid login credentials" ? "账号或密码错误，请核对后重试" : `认证异常: ${err.message}`);
      setIsSubmitting(false);
    }
  };

  // 成功状态视图
  if (successMsg) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500 bg-black">
        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle2 className="text-green-500" size={48} />
        </div>
        <h2 className="text-3xl font-black text-white mb-2">{successMsg}</h2>
        <p className="text-gray-500 text-[10px] font-black tracking-[0.4em] uppercase">Syncing Soul Data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500 relative bg-[#0a0514]">
      {/* 返回按钮 */}
      <div className="absolute top-8 left-6">
        <button 
          onClick={onBack} 
          className="p-3 bg-white/5 rounded-full border border-white/10 active:scale-90 transition-transform"
        >
          <ChevronLeft size={24} className="text-gray-400" />
        </button>
      </div>

      <div className="mb-10 relative mt-4">
        <div className="w-24 h-24 bg-purple-500/10 rounded-full flex items-center justify-center border border-purple-500/30 relative">
          <Sparkles className="text-purple-400 animate-pulse" size={40} />
          <div className="absolute inset-0 bg-purple-500/5 blur-3xl rounded-full"></div>
        </div>
      </div>

      <h1 className="text-3xl font-black mb-3 text-white tracking-tight">{isLoginMode ? '欢迎归馆' : '加入造物行列'}</h1>
      <p className="text-gray-500 text-sm mb-10 leading-relaxed max-w-[240px]">{isLoginMode ? '验证身份以同步您的私人灵感馆藏' : '在这里，每个灵感都能找到实物归宿'}</p>

      <div className="w-full max-w-sm space-y-5">
        {!isLoginMode && (
          <div className="bg-white/5 rounded-2xl p-4.5 flex items-center border border-white/5 focus-within:border-purple-500/50 transition-all">
            <User size={20} className="text-gray-500 mr-3" />
            <input 
              type="text" 
              placeholder="您的造物主昵称"
              className="bg-transparent border-none focus:ring-0 text-white w-full text-sm font-medium"
              value={nickname}
              onChange={(e) => { setNickname(e.target.value); setErrorHint(null); }}
            />
          </div>
        )}

        <div className="bg-white/5 rounded-2xl p-4.5 flex items-center border border-white/5 focus-within:border-purple-500/50 transition-all">
          <Mail size={20} className="text-gray-500 mr-3" />
          <input 
            type="email" 
            placeholder="邮箱账号"
            className="bg-transparent border-none focus:ring-0 text-white w-full text-sm font-medium"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrorHint(null); }}
          />
        </div>

        <div className="bg-white/5 rounded-2xl p-4.5 flex items-center border border-white/5 focus-within:border-purple-500/50 transition-all">
          <Lock size={20} className="text-gray-500 mr-3" />
          <input 
            type="password" 
            placeholder="通行密码"
            className="bg-transparent border-none focus:ring-0 text-white w-full text-sm font-medium"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setErrorHint(null); }}
          />
        </div>

        {errorHint && (
          <div className="flex items-center space-x-2 text-red-400 bg-red-400/5 p-3 rounded-xl border border-red-400/10 animate-in fade-in slide-in-from-top-1 duration-300">
            <AlertCircle size={14} className="shrink-0" />
            <span className="text-[11px] font-bold text-left">{errorHint}</span>
          </div>
        )}

        <button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full h-18 rounded-2xl purple-gradient flex items-center justify-center space-x-3 font-black text-lg shadow-2xl shadow-purple-500/30 active:scale-95 transition-all text-white"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (isLoginMode ? <LogIn size={20} /> : <ArrowRight size={20} />)}
          <span>{isSubmitting ? '同步中...' : (isLoginMode ? '立即进入' : '开启旅程')}</span>
        </button>

        <button 
          onClick={() => { setIsLoginMode(!isLoginMode); setErrorHint(null); }}
          className="w-full py-2 text-xs text-gray-500 font-bold hover:text-purple-400 transition-colors uppercase tracking-widest"
        >
          {isLoginMode ? '没有造物档案？点击创建' : '已有档案？点此同步'}
        </button>
      </div>

      <div className="mt-16 text-[9px] text-gray-700 font-black uppercase tracking-[0.3em]">
        Secured by Selindell Auth 2.0
      </div>
    </div>
  );
};

export default Register;
