
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface LoadingAnimationProps {
  showHint?: boolean;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ showHint }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => (prev < 98 ? prev + (Math.random() * 2) : prev));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-10 py-12 px-10 w-full animate-in fade-in duration-500">
      {/* 核心动画球 */}
      <div className="relative w-40 h-40">
        <div className="absolute inset-0 border-[6px] border-purple-500/10 rounded-full"></div>
        <div className="absolute inset-0 border-t-[6px] border-purple-500 rounded-full animate-[spin_1.5s_linear_infinite]"></div>
        <div className="absolute inset-4 border-b-[2px] border-pink-500/30 rounded-full animate-[spin_3s_linear_infinite_reverse]"></div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl rotate-45 animate-pulse shadow-[0_0_50px_rgba(168,85,247,0.4)] flex items-center justify-center">
            <span className="text-white font-black -rotate-45 tracking-tighter text-xs uppercase">tinku</span>
          </div>
        </div>
      </div>
      
      {/* 进度控制区 */}
      <div className="text-center space-y-5 w-full max-w-xs">
        <div className="space-y-3">
          <h2 className="text-2xl font-black tracking-tight bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">
            倾谷AI正在造物...
          </h2>
          <div className="flex items-center justify-center space-x-2">
            <div className="h-[1px] w-6 bg-purple-500/20"></div>
            <p className="text-purple-400 text-[9px] font-black tracking-[0.4em] uppercase">
              Tinku 1.4 Core Active
            </p>
            <div className="h-[1px] w-6 bg-purple-500/20"></div>
          </div>
        </div>

        {/* 进度条 */}
        <div className="relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/5">
          <div 
            className="h-full bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 shadow-[0_0_15px_rgba(168,85,247,0.6)] transition-all duration-1000 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* 状态文字 */}
        <div className="flex justify-between items-center text-[9px] font-bold text-gray-600">
          <span className="flex items-center">
            <span className="w-1 h-1 bg-green-500 rounded-full mr-2 animate-ping"></span>
            正在解析 3D 打印路径
          </span>
          <span className="font-mono">{Math.floor(progress)}%</span>
        </div>
      </div>

      {/* 网络拥挤提示 - 现在作为组件流的一部分，不会发生重叠 */}
      {showHint && (
        <div className="pt-6 text-center animate-in fade-in slide-in-from-bottom-2 duration-700 w-full max-w-[280px]">
          <div className="flex items-center justify-center space-x-2 text-purple-400/50 mb-2">
            <Clock size={12} className="animate-spin" />
            <span className="text-[9px] font-black uppercase tracking-widest">Deep Thinking</span>
          </div>
          <p className="text-gray-500 text-[11px] leading-relaxed">
            AI 引擎正在深度构思细节，当前网络略显拥挤，请再稍等片刻...
          </p>
        </div>
      )}
    </div>
  );
};

export default LoadingAnimation;
