
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
    visitor: { label: '访客造物主', icon: UserPlus, color: 'text-slate-400', bg: 'bg-slate-50' },
    creator: { label: '注册造物主', icon: Shield, color: 'text-blue-500', bg: 'bg-blue-50' },
    elite: { label: '资深造物主', icon: Crown, color: 'text-purple-600', bg: 'bg-purple-50' },
  }[userProfile.level];

  const menuItems = [
    { 
      icon: MapPin, 
      label: '收货地址', 
      color: 'text-purple-600', 
      onClick: () => isGuest ? setView(AppView.REGISTER) : setView(AppView.ADDRESS_LIST) 
    },
    { 
      icon: Headphones, 
      label: '联系客服', 
      color: 'text-purple-600', 
      onClick: () => setView(AppView.CUSTOMER_SERVICE) 
    },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 flex-1 overflow-y-auto no-scrollbar pb-32">
        <div className="flex justify-between items-center mb-8">
          <div className="w-10"></div>
          <h2 className="text-lg font-black text-gray-900 tracking-tight">{isGuest ? '欢迎光临' : '私人档案'}</h2>
          {!isGuest && (
            <button onClick={() => setView(AppView.SETTINGS)} className="p-2.5 bg-white border border-gray-100 rounded-full transition-all shadow-sm active:scale-95">
              <Settings size={20} className="text-slate-400" />
            </button>
          )}
          {isGuest && <div className="w-10"></div>}
        </div>

        <div className="flex flex-col items-center mb-10 text-center px-4">
          <div className="relative mb-6">
            <div className={`absolute -inset-3 rounded-full opacity-10 blur-2xl ${isElite ? 'bg-purple-500' : 'bg-transparent'}`}></div>
            <button 
              onClick={() => setIsAvatarZoomed(true)}
              className={`relative w-28 h-28 rounded-full border-4 ${isGuest ? 'border-gray-100' : isElite ? 'border-purple-600' : 'border-blue-400'} p-1.5 shadow-2xl active:scale-95 transition-transform bg-white overflow-hidden`}
            >
              <img 
                src={userProfile.avatar} 
                className="w-full h-full rounded-full object-cover" 
                alt="Avatar" 
              />
            </button>
            {!isGuest && (
              <div className={`absolute bottom-2 right-1 w-8 h-8 ${isElite ? 'bg-purple-600' : 'bg-blue-500'} rounded-full flex items-center justify-center border-4 border-white shadow-lg`}>
                {isElite ? <Crown size={16} className="text-white" /> : <BadgeCheck size={16} className="text-white" />}
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-center mb-5">
            <div className="flex items-center justify-center space-x-2.5 mb-2">
              <h1 className={`text-26 font-black tracking-tight ${isGuest ? 'text-slate-300' : 'text-gray-900'}`}>
                {userProfile.nickname}
              </h1>
              {isElite && <Gem size={18} className="text-purple-500 animate-pulse" />}
            </div>
            
            <div className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-gray-50 border border-gray-100 shadow-inner">
              <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">
                UID: {userProfile.shortId}
              </span>
              <Copy size={10} className="text-slate-300" />
            </div>
          </div>
          
          <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full border border-transparent shadow-sm mb-6 ${levelInfo.bg}`}>
            <levelInfo.icon size={14} className={levelInfo.color} />
            <span className={`text-[10px] font-black uppercase tracking-widest ${levelInfo.color}`}>
              {levelInfo.label}
            </span>
          </div>
          
          {userProfile.bio && (
            <div className="relative max-w-[300px]">
              <p className="text-xs text-slate-500 font-medium italic leading-relaxed">{userProfile.bio}</p>
            </div>
          )}
        </div>

        {!isGuest && !isElite && (
          <div className="mb-8 p-6 bg-white rounded-[28px] border border-blue-50 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">升级至资深造物主</span>
              <span className="text-[10px] font-mono font-bold text-blue-500">0 / 1 订单</span>
            </div>
            <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden shadow-inner">
              <div className="h-full w-0 bg-blue-500 transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.2)]"></div>
            </div>
            <p className="text-[10px] text-slate-400 mt-3 font-bold">完成首个订单，即可解锁专属勋章与特权</p>
          </div>
        )}

        {isGuest && (
          <div className="mb-8">
            <button 
              onClick={() => setView(AppView.REGISTER)}
              className="w-full py-5 rounded-[28px] purple-gradient shadow-2xl shadow-purple-500/20 flex items-center justify-center space-x-3 active:scale-95 transition-all"
            >
              <Sparkles size={20} className="text-white animate-pulse" />
              <span className="text-base font-black text-white">同步灵魂 / 开启创作</span>
            </button>
          </div>
        )}

        <div className="bg-white rounded-[32px] divide-y divide-gray-50 overflow-hidden mb-8 border border-gray-100 shadow-sm">
          {menuItems.map((item, idx) => (
            <button 
              key={idx} 
              onClick={item.onClick}
              className="w-full flex items-center justify-between p-6 active:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center space-x-5">
                <div className={`w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center ${item.color} shadow-sm border border-gray-50 group-hover:bg-white`}>
                  <item.icon size={22} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-gray-900">{item.label}</span>
                  {isGuest && item.label === '收货地址' && (
                    <span className="text-[9px] text-slate-300 font-bold uppercase tracking-tighter mt-0.5">请先同步灵魂数据</span>
                  )}
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-200" />
            </button>
          ))}
        </div>

        {!isGuest && (
          <button 
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full py-5 rounded-[28px] border border-red-100 text-red-500 text-sm font-bold flex items-center justify-center space-x-2 active:bg-red-50 transition-all mb-6 bg-white/50"
          >
            <LogOut size={20} />
            <span>注销当前档案</span>
          </button>
        )}

        <div className="flex flex-col items-center justify-center mt-6 space-y-6">
          <button 
            onClick={() => setView(AppView.ABOUT_US)}
            className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] hover:text-purple-600 transition-colors"
          >
            关于我们 / ABOUT US
          </button>
          
          <div className="flex items-center justify-center space-x-2.5 opacity-30">
            <Info size={10} className="text-slate-400" />
            <span className="text-[9px] font-mono font-bold text-slate-400 tracking-tighter uppercase">
              Build: 2026.01.28-v6.Lumos
            </span>
          </div>
        </div>
      </div>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-white/60 backdrop-blur-md" onClick={() => setShowLogoutConfirm(false)}></div>
          <div className="relative bg-white w-full max-w-xs rounded-[40px] p-10 border border-gray-100 text-center animate-in zoom-in-95 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)]">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
              <AlertTriangle className="text-red-500" size={36} />
            </div>
            <h3 className="text-2xl font-black mb-3 text-gray-900">确认注销吗</h3>
            <p className="text-slate-400 text-xs mb-10 font-medium leading-relaxed">退出后，您的私人灵感馆藏将暂停同步。</p>
            <div className="space-y-4">
              <button 
                onClick={() => { setShowLogoutConfirm(false); onLogout(); }}
                className="w-full py-4.5 bg-red-500 text-white rounded-[20px] font-black text-sm shadow-lg shadow-red-100 active:scale-95 transition-all"
              >
                确认退出
              </button>
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="w-full py-4.5 bg-gray-50 text-slate-400 rounded-[20px] font-black text-sm border border-gray-100 active:scale-95 transition-all"
              >
                保留登录
              </button>
            </div>
          </div>
        </div>
      )}

      {isAvatarZoomed && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300"
          onClick={() => setIsAvatarZoomed(false)}
        >
          <div className="absolute inset-0 bg-white/90 backdrop-blur-2xl"></div>
          <button className="absolute top-10 right-6 text-slate-400 p-2 hover:text-gray-900 transition-colors">
            <X size={36} />
          </button>
          <div className="relative w-full aspect-square max-w-sm rounded-[56px] overflow-hidden border-8 border-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] animate-in zoom-in-95 duration-300">
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
