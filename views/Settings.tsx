
import React, { useState, useRef } from 'react';
import { ChevronLeft, Camera, User, Mail, FileText, Check, Loader2, LogOut, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { UserProfile } from '../types.ts';
import { supabase, isSupabaseConfigured } from '../lib/supabase.ts';

interface SettingsProps { 
  userId: string; 
  profile: UserProfile; 
  onUpdate: (updates: Partial<UserProfile>) => void; 
  onBack: () => void; 
}

const SettingsView: React.FC<SettingsProps> = ({ userId, profile, onUpdate, onBack }) => {
  const [formData, setFormData] = useState({ 
    nickname: profile.nickname, 
    email: profile.email, 
    bio: profile.bio || '',
    avatar: profile.avatar 
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [fieldError, setFieldError] = useState<{field: string, msg: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setFieldError({ field: 'avatar', msg: '图片不能超过 2MB' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
        setFieldError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setFieldError(null);
    setSaveSuccess(false);

    if (formData.nickname.trim().length < 2) {
      setFieldError({ field: 'nickname', msg: '昵称至少需要 2 个字符' });
      return;
    }
    if (formData.nickname.trim().length > 12) {
      setFieldError({ field: 'nickname', msg: '昵称不能超过 12 个字符' });
      return;
    }
    if (formData.bio.length > 50) {
      setFieldError({ field: 'bio', msg: '简介请控制在 50 字以内' });
      return;
    }

    if (!isSupabaseConfigured()) { 
      alert("❌ 配置错误：Supabase 状态异常。"); 
      return; 
    }
    
    setIsSaving(true);
    try {
      const { error } = await supabase.from('users').upsert({ 
        id: userId, 
        nickname: formData.nickname.trim(),
        bio: formData.bio.trim(),
        avatar: formData.avatar
      });

      if (error) throw error;
      
      setSaveSuccess(true);
      onUpdate(formData);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error("Save error:", err);
      setFieldError({ field: 'global', msg: `更新失败: ${err.message}` });
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickLogout = async () => {
    if (window.confirm("确定要退出登录吗？")) {
      await supabase.auth.signOut();
      window.location.reload();
    }
  };

  return (
    <div className="p-6 pb-24 animate-in slide-in-from-right duration-300 min-h-screen overflow-y-auto no-scrollbar">
      <div className="flex items-center space-x-4 mb-10">
        <button onClick={onBack} className="p-2 bg-white/5 rounded-full"><ChevronLeft size={20} className="text-gray-400" /></button>
        <h2 className="text-xl font-bold text-gray-900">个人设置</h2>
      </div>

      <div className="flex flex-col items-center mb-10">
        <div 
          className={`relative group cursor-pointer active:scale-95 transition-transform ${fieldError?.field === 'avatar' ? 'animate-shake' : ''}`}
          onClick={handleAvatarClick}
        >
          <div className={`w-24 h-24 rounded-full border-2 p-1 overflow-hidden transition-all shadow-2xl ${fieldError?.field === 'avatar' ? 'border-red-500' : 'border-white/10 group-hover:border-purple-500'}`}>
            <img src={formData.avatar} className="w-full h-full rounded-full object-cover" alt="Avatar" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
              <ImageIcon size={24} className="text-white" />
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 bg-purple-500 p-2 rounded-full border-2 border-white shadow-lg">
            <Camera size={14} className="text-white" />
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileChange} 
          />
        </div>
        {saveSuccess && (
          <div className="mt-4 px-4 py-1.5 bg-green-500/10 text-green-600 rounded-full text-[10px] font-bold border border-green-500/20 animate-bounce">
            保存成功
          </div>
        )}
        {fieldError?.field === 'avatar' && (
          <p className="mt-3 text-[10px] text-red-500 font-bold uppercase tracking-widest">{fieldError.msg}</p>
        )}
        <p className="mt-3 text-[10px] text-gray-400 font-bold uppercase tracking-widest">点击更换头像</p>
      </div>

      <div className="space-y-6 mb-8">
        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">昵称</label>
            <span className={`text-[10px] font-mono ${formData.nickname.length > 12 ? 'text-red-500' : 'text-gray-400'}`}>{formData.nickname.length}/12</span>
          </div>
          <div className={`flex items-center bg-gray-50 rounded-2xl p-4 border transition-all ${fieldError?.field === 'nickname' ? 'border-red-500/50' : 'border-gray-100 focus-within:border-purple-500/50'}`}>
            <User size={18} className="text-gray-400 mr-3" />
            <input 
              type="text" 
              className="bg-transparent border-none focus:ring-0 text-sm w-full text-gray-900 placeholder:text-gray-300" 
              placeholder="请输入昵称"
              value={formData.nickname} 
              onChange={(e) => { setFormData({...formData, nickname: e.target.value}); setFieldError(null); }} 
            />
          </div>
          {fieldError?.field === 'nickname' && <p className="text-[10px] text-red-400 px-1 font-bold">{fieldError.msg}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">个人简介</label>
            <span className={`text-[10px] font-mono ${formData.bio.length > 50 ? 'text-red-500' : 'text-gray-400'}`}>{formData.bio.length}/50</span>
          </div>
          <div className={`flex items-start bg-gray-50 rounded-2xl p-4 border transition-all ${fieldError?.field === 'bio' ? 'border-red-500/50' : 'border-gray-100 focus-within:border-purple-500/50'}`}>
            <FileText size={18} className="text-gray-400 mr-3 mt-1" />
            <textarea 
              className="bg-transparent border-none focus:ring-0 text-sm w-full h-24 resize-none text-gray-900 leading-relaxed placeholder:text-gray-300" 
              placeholder="简单介绍一下自己..."
              value={formData.bio} 
              onChange={(e) => { setFormData({...formData, bio: e.target.value}); setFieldError(null); }} 
            />
          </div>
          {fieldError?.field === 'bio' && <p className="text-[10px] text-red-400 px-1 font-bold">{fieldError.msg}</p>}
        </div>
      </div>

      <div className="space-y-4 pt-4">
        {fieldError?.field === 'global' && (
          <div className="flex items-center space-x-2 text-red-400 bg-red-400/5 p-4 rounded-xl mb-2 border border-red-100">
            <AlertCircle size={16} />
            <span className="text-xs font-bold">{fieldError.msg}</span>
          </div>
        )}

        <button 
          onClick={handleSave} 
          disabled={isSaving} 
          className={`w-full h-16 rounded-2xl flex items-center justify-center space-x-3 font-black text-lg transition-all ${isSaving ? 'bg-gray-100 text-gray-400' : 'purple-gradient shadow-2xl shadow-purple-500/30 active:scale-95 text-white'}`}
        >
          {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
          <span>{isSaving ? '正在保存...' : '保存修改'}</span>
        </button>
        
        <div className="pt-8 border-t border-gray-100">
          <button 
            onClick={handleQuickLogout}
            className="w-full h-14 rounded-2xl border border-red-100 text-red-500 font-bold flex items-center justify-center space-x-2 active:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
            <span>退出登录</span>
          </button>
        </div>
        
        <button onClick={onBack} className="w-full h-14 rounded-2xl border border-gray-100 text-gray-400 font-black uppercase tracking-widest text-xs">取消并返回</button>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}</style>
    </div>
  );
};

export default SettingsView;
