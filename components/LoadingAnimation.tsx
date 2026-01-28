
import React, { useState, useEffect } from 'react';

const LoadingAnimation: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => (prev < 95 ? prev + (Math.random() * 2) : prev));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-20 px-10">
      <div className="relative w-32 h-32">
        <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full animate-[ping_2s_infinite]"></div>
        <div className="absolute inset-2 border-2 border-purple-400/40 rounded-full animate-[spin_3s_linear_infinite]"></div>
        <div className="absolute inset-4 border-t-2 border-purple-300 rounded-full animate-[spin_1.5s_linear_infinite]"></div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 bg-purple-500 rounded-lg rotate-45 animate-pulse shadow-[0_0_20px_rgba(168,85,247,0.8)]"></div>
        </div>
      </div>
      
      <div className="text-center space-y-4 w-full">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            通义万相 正在造物...
          </h2>
          <p className="text-gray-400 text-xs animate-pulse">正在从数字纬度铸造您的独家收藏品</p>
        </div>

        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
          <div 
            className="h-full bg-gradient-to-r from-purple-600 to-blue-500 transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-bold text-gray-600 uppercase tracking-widest">
          <span>{Math.floor(progress)}% RENDERING</span>
          <span>DASH SCOPE ENGINE</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingAnimation;
