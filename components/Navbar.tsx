
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
    <div className="fixed bottom-8 left-0 right-0 flex justify-center z-50 px-6">
      <nav className="glass-card rounded-full h-20 flex justify-around items-center px-6 py-2 shadow-[0_25px_60px_rgba(0,0,0,0.6)] border-white/10 relative overflow-hidden w-full max-w-sm">
        {/* Subtle glow effect behind the capsule */}
        <div className="absolute inset-0 bg-purple-500/5 -z-10 blur-2xl"></div>
        
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentView === tab.id || (tab.id === AppView.HOME && (currentView === AppView.GENERATING || currentView === AppView.RESULT));
          
          return (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={`relative flex flex-col items-center justify-center px-6 py-2 transition-all duration-500 group ${
                isActive ? 'text-purple-400' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {/* Active Pill Background */}
              {isActive && (
                <div className="absolute inset-0 bg-purple-500/10 rounded-full blur-md animate-pulse"></div>
              )}
              
              <div className={`relative transition-transform duration-300 ${isActive ? 'scale-115 -translate-y-1' : 'scale-100 hover:scale-110'}`}>
                <Icon size={isActive ? 24 : 22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              
              <span className={`text-[10px] font-black mt-1 transition-all duration-300 uppercase tracking-widest ${
                isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
              }`}>
                {tab.label}
              </span>

              {/* Dot indicator */}
              {isActive && (
                <div className="absolute -bottom-1.5 w-1 h-1 bg-purple-400 rounded-full shadow-[0_0_10px_rgba(168,85,247,1)]"></div>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Navbar;
