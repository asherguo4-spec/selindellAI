
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
      let finalUserId: string | null = null;
      let finalNickname = nickname.trim();
      let existingAvatar: string | null = null;
      let existingBio: string | null = null;

      if (isLoginMode) {
        // --- 登录模式 ---
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });
        if (error) throw error;
        finalUserId = data.user.id;
        
        // 关键修复：从 select('nickname') 改为 select('*') 以获取所有已有信息
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', finalUserId)
          .single();
        
        if (profile) {
          finalNickname = profile.nickname || '用户';
          existingAvatar = profile.avatar;
          existingBio = profile.bio;
        }
        setSuccessMsg("登录成功，欢迎回来");
      } else {
        // --- 注册模式 ---
        if (!finalNickname) {
          setErrorHint("请设置您的用户昵称");
          setIsSubmitting(false);
          return;
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
        });
        
        if (signUpError) {
          console.warn("SignUp Error, attempting auto-recovery:", signUpError.message);
          
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password.trim(),
          });
          
          if (loginError) {
            if (signUpError.message.includes("already registered")) {
              throw new Error("此账号已注册但密码不正确，请尝试重新登录。");
            }
            throw signUpError;
          }
          
          finalUserId = loginData.user.id;
          
          // 尝试获取可能存在的旧档案
          const { data: oldProfile } = await supabase.from('users').select('*').eq('id', finalUserId).single();
          if (oldProfile) {
            existingAvatar = oldProfile.avatar;
            existingBio = oldProfile.bio;
          }

          setSuccessMsg("检测到已有账号，正在同步您的数据...");
        } else {
          finalUserId = data.user?.id || null;
          setSuccessMsg("注册成功，欢迎加入");
        }
      }

      // --- 统合：重建或更新数据库档案 ---
      if (finalUserId) {
        // 关键修复：优先使用 existingAvatar 和 existingBio，如果没有再使用默认值
        const avatarToSave = existingAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${finalNickname}`;
        const bioToSave = existingBio || '在这里记录您的造物灵感';

        await supabase.from('users').upsert({
          id: finalUserId,
          nickname: finalNickname,
          avatar: avatarToSave,
          bio: bioToSave
        });
      }
      
      setTimeout(() => {
        onRegisterSuccess(finalNickname);
      }, 1500);

    } catch (err: any) {
      setErrorHint(err.message);
      setIsSubmitting(false);
    }
  };

  if (successMsg) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500 bg-black">
        <div className="w-24 h-24 bg-purple-500/20 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle2 className="text-purple-500" size={48} />
        </div>
        <h2 className="text-3xl font-black text-white mb-2">{successMsg}</h2>
        <p className="text-gray-500 text-[10px] font-black tracking-[0.4em] uppercase">Loading Data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500 relative bg-[#0a0514]">
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

      <h1 className="text-3xl font-black mb-3 text-white tracking-tight">{isLoginMode ? '欢迎登录' : '新用户注册'}</h1>
      <p className="text-gray-500 text-sm mb-10 leading-relaxed max-w-[240px]">{isLoginMode ? '请登录您的账号以同步数据' : '填写基本信息，开启您的造物体验'}</p>

      <div className="w-full max-w-sm space-y-5">
        {!isLoginMode && (
          <div className="bg-white/5 rounded-2xl p-4.5 flex items-center border border-white/5 focus-within:border-purple-500/50 transition-all">
            <User size={20} className="text-gray-500 mr-3" />
            <input 
              type="text" 
              placeholder="请输入您的昵称"
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
            placeholder="请输入邮箱地址"
            className="bg-transparent border-none focus:ring-0 text-white w-full text-sm font-medium"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrorHint(null); }}
          />
        </div>

        <div className="bg-white/5 rounded-2xl p-4.5 flex items-center border border-white/5 focus-within:border-purple-500/50 transition-all">
          <Lock size={20} className="text-gray-500 mr-3" />
          <input 
            type="password" 
            placeholder="请输入密码"
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
          <span>{isSubmitting ? '同步中...' : (isLoginMode ? '立即登录' : '立即注册')}</span>
        </button>

        <button 
          onClick={() => { setIsLoginMode(!isLoginMode); setErrorHint(null); }}
          className="w-full py-2 text-xs text-gray-500 font-bold hover:text-purple-400 transition-colors uppercase tracking-widest"
        >
          {isLoginMode ? '还没有账号？点击注册' : '已有账号？点击登录'}
        </button>
      </div>

      <div className="mt-16 text-[9px] text-gray-700 font-black uppercase tracking-[0.3em]">
        Secured by Selindell Auth
      </div>
    </div>
  );
};

export default Register;
