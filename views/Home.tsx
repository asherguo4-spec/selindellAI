
import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, AlertTriangle, Wand2, Loader2, ShoppingBag, Clock, Info, Check, RotateCcw, ChevronLeft, Send, Zap, Package, ArrowRight } from 'lucide-react';
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
  userId?: string | null;
}

const SAMPLE_PROMPTS = [
  "穿西装的机械狮子",
  "透明果冻材质的宇航员猫咪",
  "在云端垂钓的小精灵",
  "赛博霓虹风格的极地白熊"
];

const CAROUSEL_ITEMS = [
  { 
    id: 1, 
    title: '第一次造物，我们带你完成', 
    subtitle: '从一句灵感到实体手办，全流程体验', 
    identity: '官方活动 · 新手专属',
    image: 'https://images.unsplash.com/photo-1605218403317-6e55ef9977bb?auto=format&fit=crop&q=80&w=800&h=400' 
  },
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
  const [carouselIndex, setCarouselIndex] = useState(0);
  
  const inputSectionRef = useRef<HTMLDivElement>(null);

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
      setErrorMessage("请先 write 下您的灵感，哪怕是一个词也可以哦");
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

  const scrollToInput = () => {
    inputSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  if (currentView === AppView.GENERATING) return (
    <div className="h-full flex flex-col items-center justify-center relative bg-white/40">
      <div className="absolute top-4 left-4 z-50">
        <button 
          onClick={handleCancelGeneration}
          className="p-3 bg-white/60 backdrop-blur-md rounded-full border border-gray-100 active:scale-90 transition-transform flex items-center justify-center shadow-sm"
        >
          <ChevronLeft size={24} className="text-gray-400" />
        </button>
      </div>
      <LoadingAnimation showHint={showSlowNetworkHint} />
    </div>
  );

  return (
    <div className="py-8 pb-32">
      {errorMessage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-white/60 backdrop-blur-md" onClick={() => setErrorMessage(null)}></div>
          <div className="relative glass-card w-full max-w-sm rounded-[32px] p-8 border-red-100 text-center animate-in zoom-in-95 shadow-2xl">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-100">
              <AlertTriangle className="text-white" size={32} />
            </div>
            <h3 className="text-xl font-bold mb-4 text-gray-900">温馨提示</h3>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">{errorMessage}</p>
            <button onClick={() => setErrorMessage(null)} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold active:scale-95 transition-all shadow-lg">我知道了</button>
          </div>
        </div>
      )}

      {currentView === AppView.RESULT && lastResult ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-4xl font-black tracking-tight text-gray-900">{lastResult.title}</h2>
            <button onClick={() => setView(AppView.HOME)} className="text-gray-400 p-2 hover:bg-white rounded-full transition-colors border border-gray-100"><X size={24} /></button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
            <div className="md:sticky md:top-24 space-y-6">
              <div className="relative">
                <ActionFigure3DViewer images={lastResult.imageUrls} />
              </div>
              <div className="hidden md:flex gap-4">
                <button onClick={() => setView(AppView.HOME)} className="flex-1 h-16 rounded-[24px] border border-gray-200 bg-white/50 font-bold text-gray-500 active:scale-95 transition-all hover:bg-white shadow-sm">修改方案</button>
                <button onClick={() => { setPendingOrder(lastResult); setView(AppView.CHECKOUT); }} className="flex-[2] h-16 rounded-[24px] bg-gradient-to-r from-purple-600 to-pink-600 shadow-[0_15px_30px_rgba(168,85,247,0.3)] flex items-center justify-center space-x-2 font-black text-lg text-white active:scale-95 transition-all">
                  <ShoppingBag size={20} />
                  <span>立即下单实物</span>
                </button>
              </div>
            </div>
            
            <div className="space-y-8">
              {lastResult.stats && lastResult.lore && (
                <StatsCard stats={lastResult.stats} lore={lastResult.lore} />
              )}
              
              <div className="md:hidden grid grid-cols-2 gap-4 pt-4">
                <button onClick={() => setView(AppView.HOME)} className="h-16 rounded-[24px] border border-gray-200 bg-white/50 font-bold text-gray-500 active:scale-95 transition-all shadow-sm">修改方案</button>
                <button onClick={() => { setPendingOrder(lastResult); setView(AppView.CHECKOUT); }} className="h-16 rounded-[24px] bg-gradient-to-r from-purple-600 to-pink-600 shadow-[0_15px_30_rgba(168,85,247,0.3)] flex items-center justify-center space-x-2 font-black text-lg text-white active:scale-95 transition-all">
                  <ShoppingBag size={20} />
                  <span>下单实物</span>
                </button>
              </div>

              <div className="p-6 glass-card rounded-[28px] border-white/80 shadow-sm bg-white/60">
                <h4 className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-4">造物参数</h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-gray-400 font-bold">风格</span>
                    <p className="text-gray-900 font-bold">{lastResult.style}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-gray-400 font-bold">时间</span>
                    <p className="text-gray-900 font-bold">{new Date(lastResult.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in duration-500 max-w-4xl mx-auto">
          {/* Header Section - Tightened */}
          <div className="mt-1 mb-8 text-center relative">
            <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-purple-50 border border-purple-100">
              <span className="text-[10px] font-black tracking-[0.2em] text-purple-600 uppercase">人人都是造物主</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black mb-5 tracking-tight leading-tight text-gray-900">
              selindell <span className="text-purple-600">造物</span>
            </h1>
            <p className="text-slate-500 text-sm md:text-base font-medium max-w-xl mx-auto leading-relaxed">
              灵感变实物，一键下单寄送到家
            </p>
          </div>

          {/* Process Steps 指引流程 - Highly Compressed */}
          <div className="mb-8 grid grid-cols-3 gap-2 max-w-xl mx-auto px-4">
            {[
              { icon: Send, label: '输入灵感', sub: '写下奇思妙想' },
              { icon: Zap, label: 'AI 生成预览', sub: '实时渲染效果' },
              { icon: Package, label: '下单制作发货', sub: '极速寄送到家' },
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center relative">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-purple-600 shadow-sm mb-1.5">
                  <step.icon size={18} />
                </div>
                <span className="text-[11px] font-black text-gray-900 block mb-0.5">{step.label}</span>
                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter leading-none">{step.sub}</span>
                {i < 2 && <div className="absolute top-5 -right-1 hidden md:block w-full h-[1px] bg-slate-100 -z-10"></div>}
              </div>
            ))}
          </div>

          {/* Official Activity Carousel - Single Item */}
          <div className="mb-10 px-1">
            <div 
              onClick={scrollToInput}
              className="relative h-56 w-full rounded-[32px] overflow-hidden shadow-sm group border border-slate-100 cursor-pointer active:scale-[0.98] transition-all"
            >
              <img src={CAROUSEL_ITEMS[0].image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt={CAROUSEL_ITEMS[0].title} />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex flex-col justify-center px-8">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em]">{CAROUSEL_ITEMS[0].identity}</span>
                </div>
                <h3 className="text-xl md:text-3xl font-black text-white mb-2 tracking-tight">{CAROUSEL_ITEMS[0].title}</h3>
                <p className="text-xs text-gray-300 font-medium mb-6">{CAROUSEL_ITEMS[0].subtitle}</p>
                <button 
                  className="w-fit flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-full text-sm font-black shadow-xl shadow-purple-500/20 active:scale-95 transition-all"
                >
                  <span>立即开始造物</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Input Section - Optimized Contrast */}
          <div className="relative mb-12" ref={inputSectionRef}>
             <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center space-x-2 text-slate-600">
                  <Info size={12} />
                  <span className="text-[10px] font-bold uppercase tracking-widest italic">示例：一个穿着航天服的蒸汽朋克风格猫咪</span>
                </div>
                <span className={`text-[10px] font-mono font-bold ${prompt.length > 200 ? 'text-orange-500' : 'text-slate-400'}`}>
                  {prompt.length}/500
                </span>
             </div>

             {/* bg-[#E2E8F0] 提供更强的对比度，确保在亮色背景下输入框清晰可见 */}
             <div className="bg-[#E2E8F0] rounded-[40px] p-8 md:p-10 relative border border-slate-300/50 shadow-[0_15px_45px_-10px_rgba(0,0,0,0.06)] focus-within:shadow-[0_20px_50px_-20px_rgba(168,85,247,0.18)] focus-within:border-purple-400 transition-all duration-500">
                <textarea
                  className="w-full bg-transparent border-none focus:ring-0 text-xl md:text-2xl font-bold placeholder:text-slate-500 h-52 md:h-60 resize-none text-gray-900 leading-relaxed no-scrollbar"
                  placeholder="在这里写下您想要的手办样子..."
                  value={prompt}
                  maxLength={500}
                  onChange={(e) => setPrompt(e.target.value)}
                />
                
                <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between">
                  <div className="hidden sm:flex gap-2 overflow-x-auto no-scrollbar py-1">
                    {SAMPLE_PROMPTS.map((sample, i) => (
                      <button 
                        key={i}
                        onClick={() => setPrompt(sample)}
                        className="whitespace-nowrap px-4 py-2 rounded-xl bg-white/80 text-[10px] text-slate-600 border border-slate-200 hover:bg-white hover:text-purple-600 transition-all active:scale-95 shadow-sm"
                      >
                        {sample}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-col items-end space-y-2.5 ml-auto">
                    <span className="text-[9px] font-black text-purple-700/60 uppercase tracking-[0.2em] mr-2">不会写？试试 AI 自动补全</span>
                    <button
                      onClick={handleExpandPrompt}
                      disabled={!prompt.trim() || isExpanding}
                      className="flex items-center space-x-2 px-7 py-3 rounded-full bg-purple-600 text-white active:scale-95 disabled:opacity-30 border border-purple-500 shadow-xl shadow-purple-500/20 transition-all shrink-0"
                    >
                      {isExpanding ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
                      <span className="text-sm font-black">{isExpanding ? '智构中...' : '灵感增强'}</span>
                    </button>
                  </div>
                </div>
             </div>

             {expandedPreview && (
                <div className="mt-6 p-7 bg-white rounded-[32px] border border-purple-100 shadow-[0_10px_30px_-10px_rgba(168,85,247,0.1)] animate-in slide-in-from-top-4 duration-500 relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500"></div>
                   <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2 text-purple-600">
                        <Sparkles size={16} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">AI 增强建议</span>
                      </div>
                      <button onClick={() => setExpandedPreview(null)} className="text-gray-300 hover:text-gray-900 transition-colors p-1">
                        <X size={16} />
                      </button>
                   </div>
                   <p className="text-base md:text-lg text-gray-700 font-bold leading-relaxed mb-8 italic">"{expandedPreview}"</p>
                   <div className="flex gap-4">
                      <button 
                        onClick={acceptExpansion}
                        className="flex-1 h-14 rounded-2xl bg-gray-900 text-white text-sm font-black flex items-center justify-center space-x-2 active:scale-95 transition-all shadow-xl shadow-gray-200"
                      >
                        <Check size={16} />
                        <span>采纳建议</span>
                      </button>
                      <button 
                        onClick={() => setExpandedPreview(null)}
                        className="px-6 h-14 rounded-2xl bg-gray-50 text-gray-400 text-sm font-bold flex items-center justify-center space-x-2 active:scale-95 transition-all border border-gray-100"
                      >
                        <span>放弃</span>
                      </button>
                   </div>
                </div>
             )}
          </div>

          {/* Styles Selection - Compressed for mobile to show 5 items without scroll */}
          <div className="mb-10">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1 italic">选择艺术风格材质</h3>
            <div className="grid grid-cols-5 gap-2 px-1 pb-4">
              {CREATION_STYLES.map((style) => {
                const isSelected = selectedStyleId === style.id;
                return (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyleId(style.id)}
                    className={`group relative flex flex-col items-center transition-all duration-500 ${isSelected ? 'scale-105' : 'hover:scale-105'}`}
                  >
                    <div className={`w-full aspect-square rounded-2xl overflow-hidden mb-2 border-2 transition-all duration-500 relative ${
                      isSelected 
                      ? 'border-purple-500 shadow-[0_8px_20px_rgba(168,85,247,0.2)]' 
                      : 'border-white bg-slate-50 opacity-60 group-hover:opacity-100 group-hover:border-slate-100 shadow-sm'
                    }`}>
                      <img src={style.imageUrl} className="w-full h-full object-cover" alt={style.name} />
                      {isSelected && (
                        <div className="absolute inset-0 bg-purple-500/10 flex items-center justify-center">
                          <Check size={16} className="text-white drop-shadow-lg" />
                        </div>
                      )}
                    </div>
                    <p className={`text-[9px] font-black text-center tracking-tighter transition-all duration-300 whitespace-nowrap ${isSelected ? 'text-purple-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                      {style.name}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleGenerateClick}
            disabled={!prompt.trim() || isGenerating}
            className={`w-full h-24 rounded-[40px] flex items-center justify-center space-x-4 font-black text-xl md:text-2xl transition-all shadow-2xl relative overflow-hidden group ${
              prompt.trim() && !isGenerating ? 'purple-gradient text-white active:scale-95 shadow-purple-200' : 'bg-slate-100 text-slate-300 cursor-not-allowed'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
            {isGenerating ? <Loader2 className="animate-spin" size={28} /> : <Sparkles size={28} className={prompt.trim() ? "animate-pulse" : ""} />}
            <span className="relative z-10">{isGenerating ? '正在为您造物...' : '立即铸造我的专属手办'}</span>
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
