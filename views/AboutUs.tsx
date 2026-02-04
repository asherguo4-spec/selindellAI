
import React from 'react';
import { ChevronLeft, Info, Globe, MapPin, Target, Zap, Rocket, Star, Cpu } from 'lucide-react';

interface AboutUsProps {
  onBack: () => void;
}

const AboutUs: React.FC<AboutUsProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen p-6 pb-32 animate-in fade-in duration-700 h-full overflow-y-auto no-scrollbar bg-[#05020a] relative">
      {/* 氛围光效 (Ambience Orbs) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[30%] bg-blue-900/10 blur-[100px] rounded-full"></div>
      </div>

      {/* Header */}
      <div className="flex items-center space-x-4 mb-12 relative z-10">
        <button 
          onClick={onBack} 
          className="p-2.5 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 active:scale-90 transition-all hover:bg-white/10"
        >
          <ChevronLeft size={20} className="text-gray-300" />
        </button>
        <h2 className="text-lg font-black text-white/90 tracking-widest uppercase">关于 / ABOUT</h2>
      </div>

      {/* Brand Hero */}
      <div className="flex flex-col items-center mb-16 relative z-10">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-white blur-2xl opacity-20 rounded-full animate-pulse"></div>
          <div className="w-24 h-24 rounded-[32px] bg-white flex items-center justify-center relative shadow-2xl border border-white/20">
             <span className="text-black font-black text-4xl tracking-tighter italic">S</span>
          </div>
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">
            Selindell <span className="text-purple-500">塞琳德尔</span>
          </h1>
          <div className="flex items-center justify-center space-x-2">
            <div className="h-[1px] w-4 bg-white/10"></div>
            <p className="text-gray-500 text-[11px] font-black uppercase tracking-[0.4em]">Yuone Tech Ecosystem</p>
            <div className="h-[1px] w-4 bg-white/10"></div>
          </div>
        </div>
      </div>

      <div className="space-y-12 relative z-10">
        {/* Mission Section */}
        <section className="animate-in slide-in-from-bottom-4 duration-500 delay-100">
          <div className="flex items-center space-x-2 text-purple-400 mb-5 px-1">
            <Zap size={14} className="animate-pulse" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-400/80">品牌使命 / MISSION</h3>
          </div>
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/30 to-blue-600/30 rounded-[32px] blur opacity-30 group-hover:opacity-100 transition duration-1000"></div>
            <div className="relative glass-card rounded-[32px] p-8 border-white/10 bg-white/[0.03] backdrop-blur-3xl shadow-2xl">
              <p className="text-xl font-black text-white mb-4 italic leading-tight tracking-tight">“想象无界，智造有形”</p>
              <p className="text-sm text-gray-400 leading-relaxed font-medium">
                作为全球首个 <span className="text-white">AI 生成潮玩平台</span>，我们将人工智能、互联网、区块链与情绪经济深度融合，致力于将每一个瞬间的灵感转化为触手可及的实物艺术。
              </p>
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="animate-in slide-in-from-bottom-4 duration-500 delay-200">
          <div className="flex items-center space-x-2 text-gray-500 mb-5 px-1">
            <Globe size={14} />
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">公司概况 / OVERVIEW</h3>
          </div>
          <div className="glass-card rounded-[32px] p-2 border-white/10 bg-white/[0.02] backdrop-blur-2xl overflow-hidden shadow-2xl">
            <div className="divide-y divide-white/5">
              <div className="flex items-center p-5 space-x-5 group transition-colors hover:bg-white/[0.02]">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 border border-white/5 group-hover:border-purple-500/50 transition-all">
                  <Target size={20} />
                </div>
                <div>
                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">企业主体</span>
                  <p className="text-base text-white/90 font-bold mt-0.5">跃壹知品科技</p>
                </div>
              </div>
              <div className="flex items-center p-5 space-x-5 group transition-colors hover:bg-white/[0.02]">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 border border-white/5 group-hover:border-purple-500/50 transition-all">
                  <MapPin size={20} />
                </div>
                <div>
                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">总部位置</span>
                  <p className="text-base text-white/90 font-bold mt-0.5">中国 · 郑州航空港区</p>
                </div>
              </div>
              <div className="flex items-center p-5 space-x-5 group transition-colors hover:bg-white/[0.02]">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 border border-white/5 group-hover:border-purple-500/50 transition-all">
                  <Info size={20} />
                </div>
                <div>
                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">创立年份</span>
                  <p className="text-base text-white/90 font-bold mt-0.5 font-mono">2025 EST.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Future Section */}
        <section className="animate-in slide-in-from-bottom-4 duration-500 delay-300">
          <div className="flex items-center space-x-2 text-blue-400 mb-5 px-1">
            <Rocket size={14} />
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400/80">未来规划 / ROADMAP</h3>
          </div>
          <div className="glass-card rounded-[32px] p-8 border-white/10 bg-white/[0.02] backdrop-blur-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Star size={80} className="text-white" />
            </div>
            <div className="space-y-6">
              {[
                { text: "深耕 AI 潮玩定制生态", icon: Cpu, color: "bg-purple-500" },
                { text: "探索 AI 定制服饰与家具领域", icon: Globe, color: "bg-blue-500" },
                { text: "构建基于区块链的版权出售模式", icon: Rocket, color: "bg-pink-500" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center space-x-4">
                  <div className={`w-2 h-2 rounded-full ${item.color} shadow-[0_0_12px_rgba(255,255,255,0.4)] animate-pulse`}></div>
                  <span className="text-sm text-gray-300 font-bold tracking-tight">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer Slogan */}
        <div className="text-center pt-16 pb-12">
           <p className="text-[10px] text-gray-700 font-black uppercase tracking-[0.6em] opacity-40">
             Innovative Business Ecosystem
           </p>
           <p className="text-[9px] text-purple-900 font-black uppercase tracking-[0.4em] mt-3">
             Defining the next generation of toys
           </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
