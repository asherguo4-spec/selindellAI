
import React from 'react';
import { Home, Compass, ClipboardList, User } from 'lucide-react';
import { AppView } from '../types';

interface NavbarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, setView }) => {
  const tabs = [
    { id: AppView.HOME, label: '首页', icon: Home },
    { id: AppView.SQUARE, label: '广场', icon: Compass },
    { id: AppView.ORDERS, label: '订单', icon: ClipboardList },
    { id: AppView.PROFILE, label: '我的', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <nav className="w-full bg-white/80 backdrop-blur-2xl border-t border-gray-100 flex justify-around items-center h-[76px] pb-safe shadow-[0_-5px_30px_rgba(0,0,0,0.03)]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentView === tab.id || (tab.id === AppView.HOME && (currentView === AppView.GENERATING || currentView === AppView.RESULT));
          
          return (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center h-full transition-all duration-300 relative ${
                isActive ? 'text-purple-600' : 'text-slate-400'
              }`}
            >
              <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`}>
                <Icon 
                  size={24} 
                  strokeWidth={isActive ? 2.5 : 2} 
                  className={isActive ? "drop-shadow-[0_2px_10px_rgba(168,85,247,0.2)]" : ""}
                />
              </div>
              
              <span className={`text-[11px] font-bold mt-1.5 transition-all duration-300 ${
                isActive ? 'opacity-100' : 'opacity-70'
              }`}>
                {tab.label}
              </span>

              {isActive && (
                <div className="absolute top-0 w-8 h-[3px] bg-purple-500 rounded-b-full shadow-[0_2px_8px_rgba(168,85,247,0.4)]"></div>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Navbar;
