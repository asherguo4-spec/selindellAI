
import React, { useState } from 'react';
import { Settings, Shield, MapPin, Headphones, LogOut, ChevronRight, X, AlertTriangle, Sparkles, UserPlus, Info, Crown, Gem, BadgeCheck, Copy } from 'lucide-react';
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
  const isElite = userProfile.level === 'elite';

  const levelInfo = {
    visitor: { label: '访客造物主', icon: UserPlus, color: 'text-gray-500', bg: 'bg-white/5' },
    creator: { label: '注册造物主', icon: Shield, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    elite: { label: '资深造物主', icon: Crown, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  }[userProfile.level];

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
    <div className="h-full flex flex-col">
      <div className="p-6 flex-1 overflow-y-auto no-scrollbar pb-24">
        <div className="flex justify-between items-center mb-6">
          <div className="w-9"></div>
          <h2 className="text-lg font-bold">{isGuest ? '欢迎' : '个人中心'}</h2>
          {!isGuest && (
            <button onClick={() => setView(AppView.SETTINGS)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <Settings size={18} />
            </button>
          )}
          {isGuest && <div className="w-9"></div>}
        </div>

        {/* User Card */}
        <div className="flex flex-col items-center mb-8 text-center px-4">
          <div className="relative mb-5">
            <div className={`absolute -inset-2 rounded-full opacity-20 blur-xl ${isElite ? 'bg-purple-500' : 'bg-transparent'}`}></div>
            <button 
              onClick={() => setIsAvatarZoomed(true)}
              className={`relative w-24 h-24 rounded-full border-2 ${isGuest ? 'border-gray-700' : isElite ? 'border-purple-500' : 'border-blue-400'} p-1 shadow-2xl active:scale-95 transition-transform`}
            >
              <img 
                src={userProfile.avatar} 
                className="w-full h-full rounded-full object-cover" 
                alt="Avatar" 
              />
            </button>
            {!isGuest && (
              <div className={`absolute bottom-1 right-0 w-7 h-7 ${isElite ? 'bg-purple-500' : 'bg-blue-500'} rounded-full flex items-center justify-center border-2 border-[#000]`}>
                {isElite ? <Crown size={14} className="text-white" /> : <BadgeCheck size={14} className="text-white" />}
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-center mb-4">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <h1 className={`text-2xl font-black tracking-tight ${isGuest ? 'text-gray-400' : 'text-white'}`}>
                {userProfile.nickname}
              </h1>
              {isElite && <Gem size={16} className="text-purple-400 animate-pulse" />}
            </div>
            
            <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-white/5 border border-white/5">
              <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">
                ID: {userProfile.shortId}
              </span>
              <Copy size={8} className="text-gray-700" />
            </div>
          </div>
          
          <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-white/10 mb-5 ${levelInfo.bg}`}>
            <levelInfo.icon size={12} className={levelInfo.color} />
            <span className={`text-[10px] font-black uppercase tracking-widest ${levelInfo.color}`}>
              {levelInfo.label}
            </span>
          </div>
          
          {userProfile.bio && (
            <div className="relative max-w-[280px]">
              <p className="text-xs text-gray-400 italic leading-relaxed">{userProfile.bio}</p>
            </div>
          )}
        </div>

        {/* Level Progress */}
        {!isGuest && !isElite && (
          <div className="mb-6 p-4 glass-card rounded-[24px] border-blue-400/10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">升级至资深造物主</span>
              <span className="text-[10px] font-mono text-blue-400">0 / 1 订单</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full w-0 bg-blue-400 transition-all duration-1000"></div>
            </div>
            <p className="text-[9px] text-gray-600 mt-2 font-medium">完成首个订单，即可解锁专属勋章与特权</p>
          </div>
        )}

        {/* Registration CTA */}
        {isGuest && (
          <div className="mb-6">
            <button 
              onClick={() => setView(AppView.REGISTER)}
              className="w-full py-4 rounded-[24px] purple-gradient shadow-xl shadow-purple-500/20 flex items-center justify-center space-x-3 active:scale-95 transition-all"
            >
              <Sparkles size={18} className="animate-pulse" />
              <span className="text-base font-black text-white">登录 / 重塑灵魂</span>
            </button>
          </div>
        )}

        {/* Menu List */}
        <div className="glass-card rounded-[24px] divide-y divide-white/5 overflow-hidden mb-6 bg-white/[0.02]">
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
                  <span className="text-sm font-bold">{item.label}</span>
                  {isGuest && item.label === '收货地址' && (
                    <span className="text-[8px] text-gray-600 font-bold uppercase tracking-tighter">请先同步灵魂</span>
                  )}
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-600" />
            </button>
          ))}
        </div>

        {/* Logout */}
        {!isGuest && (
          <button 
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full py-4 rounded-[24px] border border-red-500/30 text-red-500 text-sm font-bold flex items-center justify-center space-x-2 active:bg-red-500/5 transition-colors mb-4"
          >
            <LogOut size={18} />
            <span>退出登录</span>
          </button>
        )}

        {/* About Us - Discreet Link */}
        <div className="flex flex-col items-center justify-center mt-4 space-y-4">
          <button 
            onClick={() => setView(AppView.ABOUT_US)}
            className="text-[10px] font-black text-gray-700 uppercase tracking-[0.2em] hover:text-purple-400 transition-colors"
          >
            关于我们
          </button>
          
          <div className="flex items-center justify-center space-x-2 opacity-20">
            <Info size={8} className="text-gray-500" />
            <span className="text-[8px] font-mono text-gray-500 tracking-tighter uppercase">
              Build: 2026.01.28-v6.跃壹知品
            </span>
          </div>
        </div>
      </div>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowLogoutConfirm(false)}></div>
          <div className="relative glass-card w-full max-w-xs rounded-[32px] p-8 border-red-500/20 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="text-red-500" size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">确认退出吗</h3>
            <p className="text-gray-500 text-xs mb-8">退出后，您的私人灵感馆藏将暂停同步。</p>
            <div className="space-y-4">
              <button 
                onClick={() => { setShowLogoutConfirm(false); onLogout(); }}
                className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold"
              >
                确认退出
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
