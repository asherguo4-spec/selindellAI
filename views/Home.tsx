
import React, { useState } from 'react';
import { Sparkles, X, ShieldCheck, Wand2, Loader2, AlertTriangle, CreditCard, ExternalLink, ShoppingBag } from 'lucide-react';
import { CREATION_STYLES } from '../constants';
import { AppView, GeneratedCreation } from '../types';
import LoadingAnimation from '../components/LoadingAnimation';
import { geminiService } from '../services/geminiService';
import ActionFigure3DViewer from '../components/ActionFigure3DViewer';
import StatsCard from '../components/StatsCard';

interface HomeProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  onCreationSuccess: (creation: GeneratedCreation) => void;
  setPendingOrder: (creation: GeneratedCreation) => void;
}

const Home: React.FC<HomeProps> = ({ currentView, setView, onCreationSuccess, setPendingOrder }) => {
  const [prompt, setPrompt] = useState('');
  const [selectedStyleId, setSelectedStyleId] = useState(CREATION_STYLES[0].id);
  const [lastResult, setLastResult] = useState<GeneratedCreation | null>(null);
  const [isExpanding, setIsExpanding] = useState(false);
  const [quotaError, setQuotaError] = useState(false);

  const handleGenerateClick = async () => {
    if (!prompt.trim()) return;
    
    const style = CREATION_STYLES.find(s => s.id === selectedStyleId) || CREATION_STYLES[0];
    setView(AppView.GENERATING);
    setQuotaError(false);
    
    console.log("UI: 开始铸造流程...");
    
    try {
      // 改为顺序执行，方便定位哪一步卡住了
      const imageUrls = await geminiService.generate360Creation(prompt, style.promptSuffix);
      console.log("UI: 图片生成完成，开始生成背景故事...");
      
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
      console.error("UI: 生图过程出错:", error);
      if (error.message?.includes('QUOTA') || error.message?.includes('Limit')) {
        setQuotaError(true);
      } else {
        alert(`造物遇到麻烦：${error.message || "网络波动，请检查控制台(F12)日志"}`);
      }
      setView(AppView.HOME);
    }
  };

  const handleExpandPrompt = async () => {
    if (!prompt.trim() || isExpanding) return;
    setIsExpanding(true);
    try {
      const expanded = await geminiService.expandPrompt(prompt);
      setPrompt(expanded);
    } catch (err) {
      console.error("Expansion failed", err);
    } finally {
      setIsExpanding(false);
    }
  };

  const handleOrderNow = () => {
    if (lastResult) {
      setPendingOrder(lastResult);
      setView(AppView.CHECKOUT);
    }
  };

  if (currentView === AppView.GENERATING) {
    return <LoadingAnimation />;
  }

  return (
    <div className="p-6 pb-24">
      {quotaError && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setQuotaError(false)}></div>
          <div className="relative glass-card w-full max-w-sm rounded-[32px] p-8 border-purple-500/30 text-center animate-in zoom-in-95">
            <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="text-purple-500" size={40} />
            </div>
            <h3 className="text-xl font-bold mb-4 text-white">API 状态异常</h3>
            <div className="space-y-4 text-gray-400 text-sm leading-relaxed mb-8">
              <p>检测到 API 调用限制或配置错误。请检查控制台日志以获取详情。</p>
            </div>
            <div className="space-y-3">
              <button 
                onClick={() => setQuotaError(false)}
                className="w-full py-4 purple-gradient text-white rounded-2xl font-bold active:scale-95 transition-transform"
              >
                返回修改
              </button>
            </div>
          </div>
        </div>
      )}

      {currentView === AppView.RESULT && lastResult ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{lastResult.title}</h2>
            <button onClick={() => setView(AppView.HOME)} className="text-gray-400 p-2 hover:bg-white/5 rounded-full"><X size={24} /></button>
          </div>

          <div className="relative group mb-8">
            <ActionFigure3DViewer images={lastResult.imageUrls} />
            <div className="absolute top-4 left-4 flex flex-col items-start gap-1 z-20">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 px-3 py-1 rounded-full flex items-center space-x-1.5 shadow-lg">
                <ShieldCheck className="text-purple-400" size={14} />
                <span className="text-[10px] font-bold tracking-widest text-white uppercase">Wan2.6 Engine</span>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            {lastResult.stats && lastResult.lore && <StatsCard stats={lastResult.stats} lore={lastResult.lore} />}
            <div className="p-5 bg-white/5 rounded-[24px] border border-white/5">
              <h3 className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-2 px-1">造物指令</h3>
              <p className="text-sm italic text-gray-300 leading-relaxed">"{lastResult.prompt}"</p>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4">
            <button onClick={() => setView(AppView.HOME)} className="h-16 rounded-[24px] border border-white/10 flex items-center justify-center font-bold text-gray-400 active:bg-white/5 transition-colors">
              重新设计
            </button>
            <button onClick={handleOrderNow} className="h-16 rounded-[24px] purple-gradient shadow-2xl flex items-center justify-center space-x-2 font-black text-lg active:scale-95 transition-all">
              <ShoppingBag size={20} />
              <span>下单实物</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-2 mb-8 text-center relative">
            <div className="inline-block mb-3 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20">
              <span className="text-xs font-black tracking-[0.2em] text-purple-400 uppercase">万相 2.6 已就绪</span>
            </div>
            <h1 className="text-4xl font-extrabold mb-2 tracking-tight">Selindell <span className="text-purple-500">造物</span></h1>
            <p className="text-gray-400 text-sm">定义属于你的限量版收藏品</p>
          </div>

          <div className="glass-card rounded-[32px] p-6 mb-8 relative border-white/10 bg-white/[0.02]">
            <textarea
              className="w-full bg-transparent border-none focus:ring-0 text-xl font-medium placeholder:text-white/20 h-36 resize-none custom-scrollbar text-white pb-12 leading-relaxed"
              placeholder="输入你的设计灵感..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <div className="absolute bottom-4 right-4">
              <button
                onClick={handleExpandPrompt}
                disabled={!prompt.trim() || isExpanding}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-purple-500/10 text-purple-400 active:scale-95 disabled:opacity-30 transition-all border border-purple-500/20"
              >
                {isExpanding ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                <span className="text-xs font-bold">灵感增强</span>
              </button>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-4 px-1">艺术风格</h3>
            <div className="grid grid-cols-5 gap-2.5">
              {CREATION_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyleId(style.id)}
                  className={`flex flex-col items-center transition-all ${selectedStyleId === style.id ? 'scale-110' : 'opacity-60'}`}
                >
                  <div className={`w-full aspect-square rounded-xl overflow-hidden mb-2 border-2 ${selectedStyleId === style.id ? 'border-purple-500' : 'border-white/10'}`}>
                    <img src={style.imageUrl} className="w-full h-full object-cover" alt={style.name} />
                  </div>
                  <p className="text-[10px] font-bold text-center text-gray-400">{style.name}</p>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerateClick}
            disabled={!prompt.trim()}
            className={`w-full h-16 rounded-[24px] flex items-center justify-center space-x-3 font-bold text-lg transition-all transform active:scale-95 ${
              prompt.trim() ? 'purple-gradient shadow-2xl shadow-purple-500/40' : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Sparkles size={22} />
            <span>铸造我的专属手办</span>
          </button>
        </>
      )}
    </div>
  );
};

export default Home;
