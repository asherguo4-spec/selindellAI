
import React, { useState } from 'react';
import { ChevronLeft, Camera, User, Mail, FileText, Check, Loader2, ShieldAlert, Terminal } from 'lucide-react';
import { UserProfile } from '../types.ts';
import { supabase, isSupabaseConfigured } from '../lib/supabase.ts';

interface SettingsProps { userId: string; profile: UserProfile; onUpdate: (updates: Partial<UserProfile>) => void; onBack: () => void; }

const SettingsView: React.FC<SettingsProps> = ({ userId, profile, onUpdate, onBack }) => {
  const [formData, setFormData] = useState({ nickname: profile.nickname, email: profile.email, bio: profile.bio || '' });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [diagInfo, setDiagInfo] = useState<{msg: string, type: 'error' | 'rlp'} | null>(null);

  const handleSave = async () => {
    setDiagInfo(null);
    setSaveSuccess(false);
    if (!isSupabaseConfigured()) { alert("❌ 配置错误：Supabase 状态异常。"); return; }
    setIsSaving(true);
    try {
      const { error } = await supabase.from('users').upsert({ 
        id: userId, 
        nickname: formData.nickname,
        bio: formData.bio 
      });

      if (error) {
        if (error.message?.includes('row-level security policy')) throw new Error("RLS_LOCKED");
        throw error;
      }
      setSaveSuccess(true);
      onUpdate(formData);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error("Save error:", err);
      setDiagInfo({ msg: `保存失败: ${err.message}`, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 pb-24 animate-in slide-in-from-right duration-300 min-h-screen overflow-y-auto no-scrollbar">
      <div className="flex items-center space-x-4 mb-10">
        <button onClick={onBack} className="p-2 bg-white/5 rounded-full"><ChevronLeft size={20} /></button>
        <h2 className="text-xl font-bold">设置个人信息</h2>
      </div>

      <div className="flex flex-col items-center mb-10">
        <div className="relative group cursor-pointer">
          <div className="w-24 h-24 rounded-full border-2 border-white/10 p-1 overflow-hidden transition-all group-hover:border-purple-500">
            <img src={profile.avatar} className="w-full h-full rounded-full object-cover" alt="Avatar" />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-purple-500 p-1.5 rounded-full border-2 border-[#0f0a19]">
            <Camera size={14} className="text-white" />
          </div>
        </div>
        {saveSuccess && (
          <div className="mt-4 px-4 py-1.5 bg-green-500/20 text-green-400 rounded-full text-[10px] font-bold border border-green-500/20 animate-bounce">
            个人档案已私有加密同步
          </div>
        )}
      </div>

      <div className="space-y-6 mb-8">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">昵称 (个人专属)</label>
          <div className="flex items-center bg-white/5 rounded-2xl p-4 border border-white/5 focus-within:border-purple-500/50">
            <User size={18} className="text-gray-500 mr-3" />
            <input type="text" className="bg-transparent border-none focus:ring-0 text-sm w-full text-white" value={formData.nickname} onChange={(e) => setFormData({...formData, nickname: e.target.value})} />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">个人简介</label>
          <div className="flex items-start bg-white/5 rounded-2xl p-4 border border-white/5 focus-within:border-purple-500/50 transition-colors">
            <FileText size={18} className="text-gray-500 mr-3 mt-1" />
            <textarea className="bg-transparent border-none focus:ring-0 text-sm w-full h-20 resize-none text-white" value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <button onClick={handleSave} disabled={isSaving} className={`w-full h-14 rounded-2xl flex items-center justify-center space-x-2 font-bold text-lg transition-all ${isSaving ? 'bg-gray-800 text-gray-500' : 'purple-gradient shadow-xl active:scale-95'}`}>
          {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
          <span>{isSaving ? '正在同步云端...' : '保存更改'}</span>
        </button>
        <button onClick={onBack} className="w-full h-14 rounded-2xl border border-white/10 text-gray-500 font-bold">返回</button>
      </div>
    </div>
  );
};

export default SettingsView;
