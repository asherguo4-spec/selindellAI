
import React, { useState } from 'react';
import { Sparkles, User, ShieldCheck, Loader2, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase.ts';

interface RegisterProps {
  userId: string;
  onRegisterSuccess: (nickname: string) => void;
}

const Register: React.FC<RegisterProps> = ({ userId, onRegisterSuccess }) => {
  const [nickname, setNickname] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!nickname.trim()) return;
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.from('users').upsert({
        id: userId,
        nickname: nickname,
        bio: '我是新进造物主',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${nickname}`
      });

      if (error) throw error;
      onRegisterSuccess(nickname);
    } catch (err: any) {
      alert(`注册同步失败: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-10 relative">
        <div className="w-24 h-24 bg-purple-500/20 rounded-full flex items-center justify-center border-2 border-purple-500/50 animate-pulse">
          <Sparkles className="text-purple-400" size={40} />
        </div>
        <div className="absolute -top-2 -right-2 bg-purple-500 text-[10px] font-black px-2 py-1 rounded-md">NEW</div>
      </div>

      <h1 className="text-3xl font-black mb-4">开启造物之旅</h1>
      <p className="text-gray-500 text-sm mb-10 leading-relaxed max-w-[240px]">
        欢迎来到 Selindell，请输入你的造物主密码，开启 AI 定制收藏品时代。
      </p>

      <div className="w-full space-y-8">
        <div className="border-b border-white/10 pb-4 px-2">
          <div className="flex items-center space-x-4">
            <User size={20} className="text-purple-400 shrink-0" />
            <input 
              type="text" 
              placeholder="输入你的昵称..."
              className="bg-transparent border-none focus:ring-0 text-xl font-bold w-full text-white placeholder:text-gray-800"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>
        </div>

        <button 
          onClick={handleRegister}
          disabled={!nickname.trim() || isSubmitting}
          className={`w-full h-16 rounded-2xl flex items-center justify-center space-x-3 font-bold text-lg transition-all ${
            nickname.trim() && !isSubmitting 
              ? 'purple-gradient shadow-xl shadow-purple-500/30 active:scale-95' 
              : 'bg-white/5 text-gray-600 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? <Loader2 className="animate-spin" /> : <ShieldCheck size={20} />}
          <span>{isSubmitting ? '正在铸造身份...' : '铸造造物主身份'}</span>
          {!isSubmitting && <ArrowRight size={18} className="ml-2" />}
        </button>
      </div>

      <div className="mt-12 flex items-center space-x-2 text-[10px] text-gray-600 font-bold tracking-widest uppercase">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        <span>私有化设备标识隔离</span>
      </div>
    </div>
  );
};

export default Register;
