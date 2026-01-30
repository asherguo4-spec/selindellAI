
import React from 'react';
import { Home, ClipboardList, User } from 'lucide-react';
import { AppView } from '../types';

interface NavbarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, setView }) => {
  const tabs = [
    { id: AppView.HOME, label: '首页', icon: Home },
    { id: AppView.ORDERS, label: '订单', icon: ClipboardList },
    { id: AppView.PROFILE, label: '我的', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* 标准底栏容器：全宽、毛玻璃效果、顶部细边框 */}
      <nav className="w-full bg-[#050505]/90 backdrop-blur-xl border-t border-white/[0.05] flex justify-around items-center h-[72px] pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.4)]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentView === tab.id || (tab.id === AppView.HOME && (currentView === AppView.GENERATING || currentView === AppView.RESULT));
          
          return (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center h-full transition-all duration-300 relative ${
                isActive ? 'text-purple-400' : 'text-gray-500'
              }`}
            >
              {/* 图标部分 */}
              <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`}>
                <Icon 
                  size={24} 
                  strokeWidth={isActive ? 2.5 : 2} 
                  className={isActive ? "drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" : ""}
                />
              </div>
              
              {/* 文字标签：标准紧凑排版 */}
              <span className={`text-[11px] font-bold mt-1.5 transition-all duration-300 ${
                isActive ? 'opacity-100' : 'opacity-80'
              }`}>
                {tab.label}
              </span>

              {/* 激活状态的顶部指示条（可选，增加视觉反馈） */}
              {isActive && (
                <div className="absolute top-0 w-8 h-[2px] bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.8)]"></div>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Navbar;
