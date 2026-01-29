
import React, { useState } from 'react';
import { Sparkles, Mail, Lock, Loader2, ArrowRight, User, LogIn, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase.ts';

interface RegisterProps {
  onRegisterSuccess: (nickname: string) => void;
}

const Register: React.FC<RegisterProps> = ({ onRegisterSuccess }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email || !password) return;
    setIsSubmitting(true);
    setSuccessMsg(null);
    
    try {
      if (isLoginMode) {
        // 登录逻辑
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        // 登录成功后尝试获取昵称
        const { data: profile } = await supabase
          .from('users')
          .select('nickname')
          .eq('id', data.user.id)
          .single();
          
        setSuccessMsg("登录成功，欢迎回来");
        setTimeout(() => {
          onRegisterSuccess(profile?.nickname || '造物主');
        }, 1500);
      } else {
        // 注册逻辑
        if (!nickname) {
          alert("请输入昵称");
          setIsSubmitting(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;

        if (data.user) {
          // 在 public.users 表中创建对应档案
          const { error: profileError } = await supabase.from('users').upsert({
            id: data.user.id,
            nickname: nickname,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${nickname}`
          });
          if (profileError) throw profileError;
          
          setSuccessMsg("注册成功，开启造物之旅");
          setTimeout(() => {
            onRegisterSuccess(nickname);
          }, 1500);
        }
      }
    } catch (err: any) {
      alert(`认证失败: ${err.message}`);
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
        <h2 className="text-2xl font-black text-white mb-2">{successMsg}</h2>
        <p className="text-gray-500 text-sm tracking-widest uppercase">正在同步灵魂档案...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
      <div className="mb-8 relative">
        <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center border-2 border-purple-500/50">
          <Sparkles className="text-purple-400" size={32} />
        </div>
      </div>

      <h1 className="text-3xl font-black mb-2">{isLoginMode ? '欢迎回来' : '开启造物之旅'}</h1>
      <p className="text-gray-500 text-sm mb-10">{isLoginMode ? '验证身份以同步您的馆藏' : '注册账号，开启 AI 定制时代'}</p>

      <div className="w-full max-w-sm space-y-4">
        {!isLoginMode && (
          <div className="bg-white/5 rounded-2xl p-4 flex items-center border border-white/5 focus-within:border-purple-500/50 transition-all">
            <User size={20} className="text-gray-500 mr-3" />
            <input 
              type="text" 
              placeholder="造物主昵称"
              className="bg-transparent border-none focus:ring-0 text-white w-full"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>
        )}

        <div className="bg-white/5 rounded-2xl p-4 flex items-center border border-white/5 focus-within:border-purple-500/50 transition-all">
          <Mail size={20} className="text-gray-500 mr-3" />
          <input 
            type="email" 
            placeholder="邮箱地址"
            className="bg-transparent border-none focus:ring-0 text-white w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="bg-white/5 rounded-2xl p-4 flex items-center border border-white/5 focus-within:border-purple-500/50 transition-all">
          <Lock size={20} className="text-gray-500 mr-3" />
          <input 
            type="password" 
            placeholder="账户密码"
            className="bg-transparent border-none focus:ring-0 text-white w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full h-16 rounded-2xl purple-gradient flex items-center justify-center space-x-3 font-bold text-lg shadow-xl shadow-purple-500/20 active:scale-95 transition-all"
        >
          {isSubmitting ? <Loader2 className="animate-spin" /> : (isLoginMode ? <LogIn size={20} /> : <ArrowRight size={20} />)}
          <span>{isSubmitting ? '同步中...' : (isLoginMode ? '立即登录' : '立即注册')}</span>
        </button>

        <button 
          onClick={() => setIsLoginMode(!isLoginMode)}
          className="text-xs text-gray-500 font-bold hover:text-purple-400 transition-colors"
        >
          {isLoginMode ? '没有账号？点击注册' : '已有账号？点击登录'}
        </button>
      </div>
    </div>
  );
};

export default Register;