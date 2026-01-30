
import React, { useState, useEffect } from 'react';
import { Sparkles, X, AlertTriangle, Wand2, Loader2, ShoppingBag, Clock, Info, Check, RotateCcw, ChevronLeft } from 'lucide-react';
import { CREATION_STYLES } from '../constants';
import { AppView, GeneratedCreation } from '../types';
import LoadingAnimation from '../components/LoadingAnimation';
import { geminiService } from '../services/aiService'; 
import ActionFigure3DViewer from '../components/ActionFigure3DViewer';
import StatsCard from '../components/StatsCard';

interface HomeProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  onCreationSuccess: (creation: GeneratedCreation) => void;
  setPendingOrder: (creation: GeneratedCreation) => void;
  // Added userId to fix prop mismatch in App.tsx
  userId?: string | null;
}

const SAMPLE_PROMPTS = [
  "穿西装的机械狮子",
  "透明果冻材质的宇航员猫咪",
  "在云端垂钓的小精灵",
  "赛博霓虹风格的极地白熊"
];

const Home: React.FC<HomeProps> = ({ currentView, setView, onCreationSuccess, setPendingOrder, userId }) => {
  const [prompt, setPrompt] = useState('');
  const [selectedStyleId, setSelectedStyleId] = useState(CREATION_STYLES[0].id);
  const [lastResult, setLastResult] = useState<GeneratedCreation | null>(null);
  const [isExpanding, setIsExpanding] = useState(false);
  const [expandedPreview, setExpandedPreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSlowNetworkHint, setShowSlowNetworkHint] = useState(false);

  useEffect(() => {
    let timer: any;
    if (isGenerating) {
      timer = setTimeout(() => setShowSlowNetworkHint(true), 8000);
    } else {
      setShowSlowNetworkHint(false);
    }
    return () => clearTimeout(timer);
  }, [isGenerating]);

  const handleGenerateClick = async () => {
    if (!prompt.trim()) {
      setErrorMessage("请先写下您的灵感，哪怕是一个词也可以哦");
      return;
    }
    if (isGenerating) return;

    const style = CREATION_STYLES.find(s => s.id === selectedStyleId) || CREATION_STYLES[0];
    setIsGenerating(true);
    setView(AppView.GENERATING);
    setErrorMessage(null);
    
    try {
      const imageUrls = await geminiService.generate360Creation(prompt, style.promptSuffix);
      const loreData = await geminiService.generateLoreAndStats(prompt);
      const newCreation: GeneratedCreation = {
        id: Math.random().toString(36).substr(2, 9),
        title: loreData.title || (prompt.substring(0, 10)),
        imageUrl: imageUrls[0],
        imageUrls: imageUrls,
        style: style.name,
        prompt: prompt,
        timestamp: Date.now(),
        status: 'pending',
        lore: loreData.lore,
        stats: loreData.stats
      };
      setLastResult(newCreation);
      onCreationSuccess(newCreation);
      setView(AppView.RESULT);
    } catch (error: any) {
      setErrorMessage(error.message || "倾谷AI引擎暂时忙碌，请稍后再试。");
      setView(AppView.HOME);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCancelGeneration = () => {
    setIsGenerating(false);
    setView(AppView.HOME);
  };

  const handleExpandPrompt = async () => {
    if (!prompt.trim()) {
      setErrorMessage("输入一些基础词汇，我才能为您变出魔法");
      return;
    }
    if (isExpanding) return;
    setIsExpanding(true);
    setErrorMessage(null);
    try {
      const expanded = await geminiService.expandPrompt(prompt);
      setExpandedPreview(expanded);
    } catch (err: any) { 
      setErrorMessage(err.message || "增强失败：请检查网络状况。");
    } finally { 
      setIsExpanding(false); 
    }
  };

  const acceptExpansion = () => {
    if (expandedPreview) {
      setPrompt(expandedPreview);
      setExpandedPreview(null);
    }
  };

  if (currentView === AppView.GENERATING) return (
    <div className="h-full flex flex-col items-center justify-center relative animate-in fade-in duration-300">
      <div className="absolute top-4 left-4 z-50">
        <button 
          onClick={handleCancelGeneration}
          className="p-3 bg-white/5 rounded-full border border-white/10 active:scale-90 transition-transform flex items-center justify-center"
        >
          <ChevronLeft size={24} className="text-gray-400" />
        </button>
      </div>

      <LoadingAnimation />
      
      {showSlowNetworkHint && (
        <div className="absolute bottom-32 px-10 text-center animate-in fade-in slide-in-from-bottom-2 duration-700">
          <div className="flex items-center justify-center space-x-2 text-purple-400/60 mb-2">
            <Clock size={12} className="animate-spin" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Deep Thinking</span>
          </div>
          <p className="text-gray-500 text-xs">AI 引擎正在深度构思细节，当前网络略显拥挤，请再稍等片刻...</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="py-8 pb-32">
      {errorMessage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setErrorMessage(null)}></div>
          <div className="relative glass-card w-full max-w-sm rounded-[32px] p-8 border-red-500/20 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="text-red-500" size={32} />
            </div>
            <h3 className="text-xl font-bold mb-4 text-white">温馨提示</h3>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">{errorMessage}</p>
            <button onClick={() => setErrorMessage(null)} className="w-full py-4 bg-white/5 text-white rounded-2xl font-bold border border-white/10 active:scale-95 transition-all">我知道了</button>
          </div>
        </div>
      )}

      {currentView === AppView.RESULT && lastResult ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-4xl font-black tracking-tight">{lastResult.title}</h2>
            <button onClick={() => setView(AppView.HOME)} className="text-gray-400 p-2 hover:bg-white/5 rounded-full transition-colors"><X size={24} /></button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
            {/* Left Column: Visuals */}
            <div className="md:sticky md:top-24 space-y-6">
              <div className="relative">
                <ActionFigure3DViewer images={lastResult.imageUrls} />
              </div>
              <div className="hidden md:flex gap-4">
                <button onClick={() => setView(AppView.HOME)} className="flex-1 h-16 rounded-[24px] border border-white/10 font-bold text-gray-400 active:scale-95 transition-all hover:bg-white/5">修改方案</button>
                <button onClick={() => { setPendingOrder(lastResult); setView(AppView.CHECKOUT); }} className="flex-[2] h-16 rounded-[24px] bg-gradient-to-r from-purple-600 to-pink-600 shadow-[0_15px_30px_rgba(168,85,247,0.4)] flex items-center justify-center space-x-2 font-black text-lg text-white active:scale-95 transition-all">
                  <ShoppingBag size={20} />
                  <span>立即下单实物</span>
                </button>
              </div>
            </div>
            
            {/* Right Column: Details */}
            <div className="space-y-8">
              {lastResult.stats && lastResult.lore && (
                <StatsCard stats={lastResult.stats} lore={lastResult.lore} />
              )}
              
              <div className="md:hidden grid grid-cols-2 gap-4 pt-4">
                <button onClick={() => setView(AppView.HOME)} className="h-16 rounded-[24px] border border-white/10 font-bold text-gray-400 active:scale-95 transition-all">修改方案</button>
                <button onClick={() => { setPendingOrder(lastResult); setView(AppView.CHECKOUT); }} className="h-16 rounded-[24px] bg-gradient-to-r from-purple-600 to-pink-600 shadow-[0_15px_30px_rgba(168,85,247,0.4)] flex items-center justify-center space-x-2 font-black text-lg text-white active:scale-95 transition-all">
                  <ShoppingBag size={20} />
                  <span>下单实物</span>
                </button>
              </div>

              <div className="p-6 glass-card rounded-[28px] border-white/5">
                <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-4">造物参数</h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-gray-600 font-bold">风格</span>
                    <p className="text-white font-medium">{lastResult.style}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-gray-600 font-bold">时间</span>
                    <p className="text-white font-medium">{new Date(lastResult.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in duration-500 max-w-4xl mx-auto">
          <div className="mt-2 mb-12 text-center relative">
            <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20">
              <span className="text-xs font-black tracking-[0.2em] text-purple-400 uppercase">人人都是造物主</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight leading-tight">Selindell <span className="text-purple-500">造物</span></h1>
            <p className="text-gray-400 text-sm md:text-base font-medium max-w-lg mx-auto">只需一句话，我们将您的无限灵感转化为独一无二的专属艺术手办</p>
          </div>

          <div className="relative mb-12">
             <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center space-x-2 text-gray-500">
                  <Info size={12} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">描述越具体，生成效果越惊艳</span>
                </div>
                <span className={`text-[10px] font-mono font-bold ${prompt.length > 200 ? 'text-orange-500' : 'text-gray-600'}`}>
                  {prompt.length}/500
                </span>
             </div>

             <div className="glass-card rounded-[32px] p-8 relative border-white/10 bg-white/[0.02] shadow-inner focus-within:border-purple-500/40 transition-all duration-500">
                <textarea
                  className="w-full bg-transparent border-none focus:ring-0 text-xl md:text-2xl font-medium placeholder:text-white/10 h-48 md:h-56 resize-none text-white leading-relaxed no-scrollbar"
                  placeholder="例如：一只在霓虹都市中滑板的小熊猫..."
                  value={prompt}
                  maxLength={500}
                  onChange={(e) => setPrompt(e.target.value)}
                />
                
                <div className="absolute bottom-6 left-8 right-8 flex items-center justify-between">
                  <div className="hidden sm:flex gap-2 overflow-x-auto no-scrollbar py-1">
                    {SAMPLE_PROMPTS.map((sample, i) => (
                      <button 
                        key={i}
                        onClick={() => setPrompt(sample)}
                        className="whitespace-nowrap px-4 py-1.5 rounded-xl bg-white/5 text-[10px] text-gray-500 border border-white/5 hover:bg-white/10 hover:text-white transition-all active:scale-95"
                      >
                        {sample}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleExpandPrompt}
                    disabled={!prompt.trim() || isExpanding}
                    className="flex items-center space-x-2 px-6 py-2.5 rounded-full bg-purple-500/10 text-purple-400 active:scale-95 disabled:opacity-30 border border-purple-500/20 transition-all shadow-lg shrink-0 ml-auto"
                  >
                    {isExpanding ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                    <span className="text-sm font-bold">{isExpanding ? '扩写中...' : '灵感增强'}</span>
                  </button>
                </div>
             </div>

             {expandedPreview && (
                <div className="mt-6 p-6 glass-card rounded-[32px] border-purple-500/30 bg-purple-500/5 animate-in slide-in-from-top-4 duration-500 relative">
                   <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2 text-purple-400">
                        <Sparkles size={16} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">AI 增强建议</span>
                      </div>
                      <button onClick={() => setExpandedPreview(null)} className="text-gray-600 hover:text-white transition-colors p-1">
                        <X size={16} />
                      </button>
                   </div>
                   <p className="text-base md:text-lg text-gray-300 leading-relaxed mb-6 italic">"{expandedPreview}"</p>
                   <div className="flex gap-4">
                      <button 
                        onClick={acceptExpansion}
                        className="flex-1 h-12 rounded-2xl bg-purple-500 text-white text-sm font-black flex items-center justify-center space-x-2 active:scale-95 transition-all shadow-lg shadow-purple-500/20"
                      >
                        <Check size={16} />
                        <span>采纳建议</span>
                      </button>
                      <button 
                        onClick={() => setExpandedPreview(null)}
                        className="px-6 h-12 rounded-2xl bg-white/5 text-gray-400 text-sm font-bold flex items-center justify-center space-x-2 active:scale-95 transition-all"
                      >
                        <span>放弃</span>
                      </button>
                   </div>
                </div>
             )}
          </div>

          <div className="mb-12">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6 px-1">材质风格系统</h3>
            {/* 改进后的布局：移动端横向滑动，桌面端矩阵 */}
            <div className="flex overflow-x-auto no-scrollbar -mx-4 px-4 pb-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-5 gap-4">
              {CREATION_STYLES.map((style) => {
                const isSelected = selectedStyleId === style.id;
                return (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyleId(style.id)}
                    className={`flex-none w-[28%] sm:w-auto group relative flex flex-col items-center transition-all duration-500 ${isSelected ? 'scale-105' : 'hover:scale-105'}`}
                  >
                    <div className={`w-full aspect-square rounded-2xl md:rounded-3xl overflow-hidden mb-3 border-2 transition-all duration-500 relative ${
                      isSelected 
                      ? 'border-purple-500 shadow-[0_0_20_rgba(168,85,247,0.3)]' 
                      : 'border-white/5 opacity-40 group-hover:opacity-100 group-hover:border-white/20'
                    }`}>
                      <img src={style.imageUrl} className="w-full h-full object-cover" alt={style.name} />
                      {isSelected && (
                        <div className="absolute inset-0 bg-purple-500/10 flex items-center justify-center">
                          <Check size={24} className="text-white drop-shadow-lg md:hidden" />
                          <Check size={28} className="text-white drop-shadow-lg hidden md:block" />
                        </div>
                      )}
                    </div>
                    <p className={`text-[9px] md:text-xs font-black text-center tracking-tighter transition-all duration-300 ${isSelected ? 'text-purple-400' : 'text-gray-600 group-hover:text-gray-400'}`}>
                      {style.name}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleGenerateClick}
            disabled={!prompt.trim() || isGenerating}
            className={`w-full h-24 rounded-[40px] flex items-center justify-center space-x-4 font-black text-xl md:text-2xl transition-all shadow-2xl relative overflow-hidden group ${
              prompt.trim() && !isGenerating ? 'purple-gradient text-white active:scale-95' : 'bg-white/5 text-gray-600 cursor-not-allowed'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
            {isGenerating ? <Loader2 className="animate-spin" size={28} /> : <Sparkles size={28} className={prompt.trim() ? "animate-pulse" : ""} />}
            <span className="relative z-10">{isGenerating ? '正在为你造物...' : '铸造我的专属手办'}</span>
          </button>
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default Home;
