
import React, { useState } from 'react';
import { Settings, Shield, MapPin, Headphones, LogOut, ChevronRight, X, UserPlus, Info, Crown, Gem, BadgeCheck, Copy } from 'lucide-react';
import { AppView, UserProfile } from '../types.ts';

interface ProfileProps {
  setView: (view: AppView) => void;
  userProfile: UserProfile;
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ setView, userProfile, onLogout }) => {
  const [isAvatarZoomed, setIsAvatarZoomed] = useState(false);
  const isGuest = !userProfile.isRegistered;
  const isElite = userProfile.level === 'elite';

  const levelInfo = {
    visitor: { label: '访客', icon: UserPlus, color: 'text-slate-400', bg: 'bg-slate-50' },
    creator: { label: '正式成员', icon: Shield, color: 'text-blue-500', bg: 'bg-blue-50' },
    elite: { label: '高级成员', icon: Crown, color: 'text-purple-600', bg: 'bg-purple-50' },
  };

  const currentLevel = levelInfo[userProfile.level as keyof typeof levelInfo] || levelInfo.visitor;

  const handleHeaderClick = () => {
    if (!isGuest) {
      setView(AppView.SETTINGS);
    }
  };

  return (
    <div className="h-full bg-[#f7f7f7] flex flex-col font-sans overflow-y-auto no-scrollbar">
      {/* 顶部用户信息区域 - 仿微信风格，支持点击进入设置 */}
      <div 
        onClick={handleHeaderClick}
        className={`bg-white px-6 pt-16 pb-12 flex items-center space-x-5 mb-2 shrink-0 transition-colors ${!isGuest ? 'active:bg-gray-50 cursor-pointer' : ''}`}
      >
        <div className="relative shrink-0">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsAvatarZoomed(true); }}
            className="w-16 h-16 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 active:scale-95 transition-transform shadow-sm"
          >
            <img src={userProfile.avatar} className="w-full h-full object-cover" alt="avatar" />
          </button>
          {!isGuest && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
               {isElite ? <Crown size={12} className="text-purple-600" /> : <BadgeCheck size={12} className="text-blue-500" />}
            </div>
          )}
        </div>
        
        <div className="flex-1 flex flex-col justify-center min-w-0">
          <div className="flex items-center space-x-2 mb-0.5">
            <h1 className="text-2xl font-bold text-gray-900 truncate">{userProfile.nickname}</h1>
            {isElite && <Gem size={16} className="text-purple-500 shrink-0" />}
          </div>
          <div className="flex flex-wrap items-center text-gray-400 gap-2">
            <span className="text-[13px] font-medium text-gray-400 whitespace-nowrap overflow-visible">UID: {userProfile.shortId}</span>
            <button 
              onClick={(e) => { e.stopPropagation(); /* 复制逻辑 */ }} 
              className="shrink-0 text-gray-300 active:text-purple-500"
            >
               <Copy size={12} />
            </button>
            <div className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-gray-50 border border-gray-100 shrink-0">
               <currentLevel.icon size={10} className={currentLevel.color} />
               <span className={`text-[9px] font-bold ${currentLevel.color}`}>{currentLevel.label}</span>
            </div>
          </div>
          {userProfile.bio && (
            <p className="text-xs text-gray-400 mt-2 line-clamp-1">{userProfile.bio}</p>
          )}
        </div>
        
        {isGuest ? (
          <button 
            onClick={(e) => { e.stopPropagation(); setView(AppView.REGISTER); }}
            className="px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-lg active:scale-95 shrink-0 shadow-sm"
          >
            登录 / 注册
          </button>
        ) : (
          <ChevronRight size={20} className="text-gray-300 shrink-0" />
        )}
      </div>

      {/* 升级进度区域 */}
      {!isGuest && !isElite && (
        <div className="bg-white px-6 py-4 mb-2 shrink-0">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[11px] font-bold text-gray-500">升级进度</span>
            <span className="text-[11px] font-mono text-purple-600 font-bold">0 / 1 订单</span>
          </div>
          <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full w-0 bg-purple-600 transition-all duration-1000"></div>
          </div>
          <p className="text-[9px] text-gray-400 mt-1.5">完成首个订单，即可解锁专属勋章与特权</p>
        </div>
      )}

      {/* 列表菜单区域 */}
      <div className="bg-white mb-2 divide-y divide-gray-50 shrink-0">
        <button 
          onClick={() => isGuest ? setView(AppView.REGISTER) : setView(AppView.ADDRESS_LIST)}
          className="w-full flex items-center justify-between px-6 py-4 active:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-4">
            <MapPin size={22} className="text-purple-600" />
            <span className="text-[16px] text-gray-900">收货地址</span>
          </div>
          <ChevronRight size={18} className="text-gray-200" />
        </button>
        
        <button 
          onClick={() => setView(AppView.CUSTOMER_SERVICE)}
          className="w-full flex items-center justify-between px-6 py-4 active:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-4">
            <Headphones size={22} className="text-purple-600" />
            <span className="text-[16px] text-gray-900">联系客服</span>
          </div>
          <ChevronRight size={18} className="text-gray-200" />
        </button>
      </div>

      {!isGuest && (
        <div className="bg-white mb-6 shrink-0">
          <button 
            onClick={() => onLogout()}
            className="w-full flex items-center justify-center py-4 text-red-500 font-medium text-[16px] active:bg-gray-50 transition-colors"
          >
            退出登录
          </button>
        </div>
      )}

      {/* 底部信息 */}
      <div className="pb-24 flex flex-col items-center space-y-4 mt-4">
        <button 
          onClick={() => setView(AppView.ABOUT_US)}
          className="text-xs text-gray-400 font-medium hover:text-purple-600 transition-colors"
        >
          关于我们
        </button>
        <div className="flex items-center justify-center space-x-2.5 opacity-30">
          <Info size={10} className="text-slate-400" />
          <span className="text-[9px] font-mono font-bold text-slate-400 tracking-tighter uppercase">
            Build: 2026.01.28-v6.Lumos
          </span>
        </div>
      </div>

      {/* 头像放大模态框 */}
      {isAvatarZoomed && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300"
          onClick={() => setIsAvatarZoomed(false)}
        >
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm"></div>
          <button className="absolute top-10 right-6 text-white p-2">
            <X size={32} />
          </button>
          <div className="relative w-full aspect-square max-w-sm rounded-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <img src={userProfile.avatar} className="w-full h-full object-cover" alt="avatar-large" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
