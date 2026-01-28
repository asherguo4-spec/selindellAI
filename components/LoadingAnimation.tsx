
import React, { useState, useEffect } from 'react';

const LoadingAnimation: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => (prev < 98 ? prev + (Math.random() * 2) : prev));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-12 py-32 px-10">
      <div className="relative w-44 h-44">
        <div className="absolute inset-0 border-[6px] border-purple-500/10 rounded-full"></div>
        <div className="absolute inset-0 border-t-[6px] border-purple-500 rounded-full animate-[spin_1.5s_linear_infinite]"></div>
        <div className="absolute inset-4 border-b-[2px] border-pink-500/30 rounded-full animate-[spin_3s_linear_infinite_reverse]"></div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-3xl rotate-45 animate-pulse shadow-[0_0_50px_rgba(168,85,247,0.5)] flex items-center justify-center">
            <span className="text-white font-black -rotate-45 tracking-tighter text-base uppercase">tinku</span>
          </div>
        </div>
      </div>
      
      <div className="text-center space-y-6 w-full max-w-xs">
        <div className="space-y-3">
          <h2 className="text-3xl font-black tracking-tighter bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">
            倾谷AI正在造物...
          </h2>
          <div className="flex items-center justify-center space-x-2">
            <div className="h-[1px] w-8 bg-purple-500/30"></div>
            <p className="text-purple-400 text-[10px] font-black tracking-[0.4em] uppercase">
              Tinku 1.4 Core Active
            </p>
            <div className="h-[1px] w-8 bg-purple-500/30"></div>
          </div>
        </div>

        <div className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/5">
          <div 
            className="h-full bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 shadow-[0_0_20px_rgba(168,85,247,0.8)] transition-all duration-1000 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="flex justify-between items-center text-[10px] font-bold text-gray-600">
          <span className="flex items-center">
            <span className="w-1 h-1 bg-green-500 rounded-full mr-2 animate-ping"></span>
            正在解析 3D 打印路径
          </span>
          <span className="font-mono">{Math.floor(progress)}%</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingAnimation;
