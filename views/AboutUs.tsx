
import React from 'react';
import { ChevronLeft, Info, Globe, MapPin, Target, Zap, Rocket } from 'lucide-react';

interface AboutUsProps {
  onBack: () => void;
}

const AboutUs: React.FC<AboutUsProps> = ({ onBack }) => {
  return (
    <div className="p-6 pb-32 animate-in slide-in-from-right duration-300 h-full overflow-y-auto no-scrollbar bg-black">
      <div className="flex items-center space-x-4 mb-10">
        <button onClick={onBack} className="p-2 bg-white/5 rounded-full"><ChevronLeft size={20} /></button>
        <h2 className="text-xl font-bold text-white">关于我们</h2>
      </div>

      <div className="flex flex-col items-center mb-12">
        <div className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center mb-4 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
           <span className="text-black font-black text-3xl tracking-tighter italic">S</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">Selindell <span className="text-purple-500">塞琳德尔</span></h1>
        <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Yuone Tech</p>
      </div>

      <div className="space-y-10">
        <section>
          <div className="flex items-center space-x-2 text-purple-400 mb-4 px-1">
            < Zap size={14} />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">品牌使命</h3>
          </div>
          <div className="glass-card rounded-3xl p-6 border-white/5">
            <p className="text-lg font-bold text-white mb-2 italic">“想象无界，智造有形”</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              作为全球首个 AI 生成潮玩平台，我们将人工智能、互联网、区块链与情绪经济深度融合，致力于将每一个瞬间的灵感转化为触手可及的实物艺术。
            </p>
          </div>
        </section>

        <section>
          <div className="flex items-center space-x-2 text-purple-400 mb-4 px-1">
            <Globe size={14} />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">公司概况</h3>
          </div>
          <div className="glass-card rounded-3xl p-6 border-white/5 space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                <Target size={16} className="text-gray-400" />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-300">企业主体</span>
                <p className="text-sm text-white font-medium mt-0.5">跃壹知品科技</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                <MapPin size={16} className="text-gray-400" />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-300">总部位置</span>
                <p className="text-sm text-white font-medium mt-0.5">中国·郑州航空港区</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                <Info size={16} className="text-gray-400" />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-300">创立年份</span>
                <p className="text-sm text-white font-medium mt-0.5">2025 年</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center space-x-2 text-purple-400 mb-4 px-1">
            <Rocket size={14} />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">未来规划</h3>
          </div>
          <div className="glass-card rounded-3xl p-6 border-white/5">
            <ul className="space-y-4">
              <li className="flex items-center space-x-3">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]"></div>
                <span className="text-sm text-white font-medium">深耕 AI 潮玩定制生态</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
                <span className="text-sm text-white font-medium">探索 AI 定制服饰与家具领域</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-1.5 h-1.5 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.8)]"></div>
                <span className="text-sm text-white font-medium">构建基于区块链的版权出售商业模式</span>
              </li>
            </ul>
          </div>
        </section>

        <div className="text-center pt-8 opacity-40">
           <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.4em]">Innovative Business Ecosystem</p>
           <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.4em] mt-1">Defining the next decade</p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
