
import React, { useState } from 'react';
import { Settings, Shield, MapPin, Headphones, LogOut, ChevronRight, X, Quote, AlertTriangle, Sparkles, UserPlus, Info } from 'lucide-react';
import { AppView, UserProfile } from '../types.ts';

interface ProfileProps {
  setView: (view: AppView) => void;
  userProfile: UserProfile;
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ setView, userProfile, onLogout }) => {
  const [isAvatarZoomed, setIsAvatarZoomed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const isGuest = !userProfile.isRegistered;

  const menuItems = [
    { 
      icon: MapPin, 
      label: '收货地址', 
      color: 'text-purple-400', 
      onClick: () => isGuest ? setView(AppView.REGISTER) : setView(AppView.ADDRESS_LIST) 
    },
    { 
      icon: Headphones, 
      label: '联系客服', 
      color: 'text-purple-400', 
      onClick: () => setView(AppView.CUSTOMER_SERVICE) 
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div className="w-9"></div>
          <h2 className="text-lg font-bold">{isGuest ? '欢迎' : '个人中心'}</h2>
          {!isGuest && (
            <button onClick={() => setView(AppView.SETTINGS)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <Settings size={20} />
            </button>
          )}
          {isGuest && <div className="w-9"></div>}
        </div>

        {/* User Card */}
        <div className="flex flex-col items-center mb-8 text-center px-4">
          <div className="relative mb-4">
            <button 
              onClick={() => setIsAvatarZoomed(true)}
              className={`w-24 h-24 rounded-full border-2 ${isGuest ? 'border-gray-700' : 'border-purple-500'} p-1 shadow-[0_0_20px_rgba(168,85,247,0.15)] active:scale-95 transition-transform`}
            >
              <img 
                src={userProfile.avatar} 
                className="w-full h-full rounded-full object-cover grayscale-[0.5]" 
                alt="Avatar" 
              />
            </button>
            {!isGuest && (
              <div className="absolute bottom-1 right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center border-2 border-[#0f0a19]">
                <Shield size={12} className="text-white" />
              </div>
            )}
          </div>
          
          <h1 className={`text-2xl font-black mb-1 tracking-tight ${isGuest ? 'text-gray-400' : 'text-white'}`}>
            {userProfile.nickname}
          </h1>
          
          {!isGuest ? (
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/10 mb-6">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">ID:</span>
              <span className="text-[10px] font-mono text-purple-400 font-bold">{userProfile.id}</span>
            </div>
          ) : (
            <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-6">快去注册吧</div>
          )}
          
          {userProfile.bio && (
            <div className="relative max-w-[280px]">
              <Quote size={12} className="absolute -top-1 -left-4 text-purple-500/40 rotate-180" />
              <p className="text-sm text-gray-400 italic leading-relaxed">{userProfile.bio}</p>
              <Quote size={12} className="absolute -bottom-1 -right-4 text-purple-500/40" />
            </div>
          )}
        </div>

        {/* Registration CTA for Guests */}
        {isGuest && (
          <div className="mb-8">
            <button 
              onClick={() => setView(AppView.REGISTER)}
              className="w-full py-6 rounded-[32px] purple-gradient shadow-xl shadow-purple-500/20 flex flex-col items-center justify-center space-y-2 active:scale-95 transition-transform"
            >
              <div className="flex items-center space-x-2">
                <Sparkles size={20} className="animate-pulse" />
                <span className="text-lg font-black">新用户注册</span>
              </div>
              <p className="text-[10px] opacity-70 font-bold uppercase tracking-widest">设置密码 & 专属 ID</p>
            </button>
          </div>
        )}

        {/* Menu List */}
        <div className="glass-card rounded-[28px] divide-y divide-white/5 overflow-hidden mb-8">
          {menuItems.map((item, idx) => (
            <button 
              key={idx} 
              onClick={item.onClick}
              className="w-full flex items-center justify-between p-5 active:bg-white/5 transition-colors text-left"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${item.color}`}>
                  <item.icon size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">{item.label}</span>
                  {isGuest && item.label === '收货地址' && (
                    <span className="text-[9px] text-gray-600 font-bold">快去注册吧</span>
                  )}
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-600" />
            </button>
          ))}
        </div>

        {/* Logout (Only for Registered Users) */}
        {!isGuest && (
          <button 
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full py-5 rounded-[24px] border border-red-500/30 text-red-500 font-bold flex items-center justify-center space-x-2 active:bg-red-500/5 transition-colors mb-4"
          >
            <LogOut size={20} />
            <span>退出登录</span>
          </button>
        )}

        {/* Build Version Indicator */}
        <div className="flex items-center justify-center space-x-2 mt-8 opacity-20 hover:opacity-100 transition-opacity">
          <Info size={10} className="text-gray-500" />
          <span className="text-[8px] font-mono text-gray-500 tracking-tighter uppercase">
            Core Build: 2026.01.28-v3.black_theme
          </span>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowLogoutConfirm(false)}></div>
          <div className="relative glass-card w-full max-w-xs rounded-[32px] p-6 border-red-500/20 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="text-red-500" size={32} />
            </div>
            <h3 className="text-lg font-bold mb-2 text-white">真的要退出登录吗</h3>
            <p className="text-gray-500 text-xs mb-6 leading-relaxed">
              退出登录后，用户资料将不复存在<b>物理抹除</b>。
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => { setShowLogoutConfirm(false); onLogout(); }}
                className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold active:scale-95 transition-transform"
              >
                确认退出登录
              </button>
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="w-full py-4 bg-white/5 text-gray-400 rounded-2xl font-bold"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Zoom Overlay */}
      {isAvatarZoomed && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300"
          onClick={() => setIsAvatarZoomed(false)}
        >
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md"></div>
          <button className="absolute top-10 right-6 text-white p-2">
            <X size={32} />
          </button>
          <div className="relative w-full aspect-square max-w-sm rounded-[48px] overflow-hidden border-2 border-purple-500/30 shadow-[0_0_50px_rgba(168,85,247,0.4)] animate-in zoom-in-95 duration-300">
            <img 
              src={userProfile.avatar} 
              className="w-full h-full object-cover" 
              alt="Zoomed Avatar" 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
