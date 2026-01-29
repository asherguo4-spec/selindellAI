
import React, { useState } from 'react';
import { Sparkles, X, AlertTriangle, Wand2, Loader2, ShoppingBag } from 'lucide-react';
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
}

const Home: React.FC<HomeProps> = ({ currentView, setView, onCreationSuccess, setPendingOrder }) => {
  const [prompt, setPrompt] = useState('');
  const [selectedStyleId, setSelectedStyleId] = useState(CREATION_STYLES[0].id);
  const [lastResult, setLastResult] = useState<GeneratedCreation | null>(null);
  const [isExpanding, setIsExpanding] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGenerateClick = async () => {
    if (!prompt.trim()) return;
    const style = CREATION_STYLES.find(s => s.id === selectedStyleId) || CREATION_STYLES[0];
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
    }
  };

  const handleExpandPrompt = async () => {
    if (!prompt.trim() || isExpanding) return;
    setIsExpanding(true);
    try {
      const expanded = await geminiService.expandPrompt(prompt);
      setPrompt(expanded);
    } catch (err) { console.error(err); } 
    finally { setIsExpanding(false); }
  };

  if (currentView === AppView.GENERATING) return <LoadingAnimation />;

  return (
    <div className="p-6 pb-24">
      {errorMessage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setErrorMessage(null)}></div>
          <div className="relative glass-card w-full max-w-sm rounded-[32px] p-8 border-purple-500/30 text-center animate-in zoom-in-95">
            <AlertTriangle className="text-red-500 mx-auto mb-6" size={32} />
            <h3 className="text-xl font-bold mb-4 text-white">铸造异常</h3>
            <p className="text-gray-400 text-sm mb-8">{errorMessage}</p>
            <button onClick={() => setErrorMessage(null)} className="w-full py-4 purple-gradient text-white rounded-2xl font-bold">我知道了</button>
          </div>
        </div>
      )}

      {currentView === AppView.RESULT && lastResult ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{lastResult.title}</h2>
            <button onClick={() => setView(AppView.HOME)} className="text-gray-400 p-2"><X size={24} /></button>
          </div>
          <div className="relative mb-8">
            <ActionFigure3DViewer images={lastResult.imageUrls} />
          </div>
          <div className="grid gap-6">
            {lastResult.stats && lastResult.lore && <StatsCard stats={lastResult.stats} lore={lastResult.lore} />}
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4">
            <button onClick={() => setView(AppView.HOME)} className="h-16 rounded-[24px] border border-white/10 font-bold text-gray-400">修改方案</button>
            <button onClick={() => { setPendingOrder(lastResult); setView(AppView.CHECKOUT); }} className="h-16 rounded-[24px] bg-gradient-to-r from-purple-600 to-pink-600 shadow-[0_15px_30px_rgba(168,85,247,0.4)] flex items-center justify-center space-x-2 font-black text-lg text-white">
              <ShoppingBag size={20} />
              <span>下单实物</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-2 mb-8 text-center relative">
            <div className="inline-block mb-3 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20">
              <span className="text-xs font-black tracking-[0.2em] text-purple-400 uppercase">人人都是造物主</span>
            </div>
            <h1 className="text-4xl font-extrabold mb-2 tracking-tight">Selindell <span className="text-purple-500">造物</span></h1>
            <p className="text-gray-400 text-sm">输入灵感，生成属于你的专属手办</p>
          </div>

          <div className="glass-card rounded-[32px] p-6 mb-8 relative border-white/10 bg-white/[0.02]">
            <textarea
              className="w-full bg-transparent border-none focus:ring-0 text-xl font-medium placeholder:text-white/20 h-40 resize-none text-white leading-relaxed no-scrollbar"
              placeholder="例如：一只长翅膀的小熊猫..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <div className="absolute bottom-4 right-4">
              <button
                onClick={handleExpandPrompt}
                disabled={!prompt.trim() || isExpanding}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-purple-500/10 text-purple-400 active:scale-95 disabled:opacity-30 border border-purple-500/20"
              >
                {isExpanding ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                <span className="text-xs font-bold">灵感增强</span>
              </button>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 px-1">材质风格</h3>
            <div className="grid grid-cols-5 gap-2.5">
              {CREATION_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyleId(style.id)}
                  className={`flex flex-col items-center transition-all ${selectedStyleId === style.id ? 'scale-110' : 'opacity-40'}`}
                >
                  <div className={`w-full aspect-square rounded-xl overflow-hidden mb-2 border-2 ${selectedStyleId === style.id ? 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'border-white/5'}`}>
                    <img src={style.imageUrl} className="w-full h-full object-cover" alt={style.name} />
                  </div>
                  <p className="text-[9px] font-bold text-center text-gray-500">{style.name}</p>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerateClick}
            disabled={!prompt.trim()}
            className={`w-full h-20 rounded-[28px] flex items-center justify-center space-x-4 font-black text-xl transition-all shadow-2xl ${
              prompt.trim() ? 'purple-gradient text-white active:scale-95' : 'bg-white/5 text-gray-600'
            }`}
          >
            <Sparkles size={24} className={prompt.trim() ? "animate-pulse" : ""} />
            <span>开始铸造我的专属手办</span>
          </button>
        </>
      )}
    </div>
  );
};

export default Home;
