
import React, { useEffect, useState } from 'react';
import { GeneratedCreation } from '../types';
import { supabase } from '../lib/supabase.ts';
import { Loader2, Sparkles, X } from 'lucide-react';
import StatsCard from '../components/StatsCard';

// 扩展类型用于展示作者
interface SquareItem extends GeneratedCreation {
  creatorName?: string;
  creatorAvatar?: string;
}

const Square: React.FC = () => {
  const [items, setItems] = useState<SquareItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<SquareItem | null>(null);

  // 官方预设作品
  const officialItems: SquareItem[] = [
    {
      id: 'official-1',
      title: '赛博灵猫 · 极光版',
      imageUrl: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?auto=format&fit=crop&q=80&w=600',
      imageUrls: ['https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?auto=format&fit=crop&q=80&w=600'],
      style: '赛博朋克',
      prompt: '一只全身流淌着极光色彩的赛博猫咪，半透明机甲材质，瞳孔闪烁霓虹光芒。',
      timestamp: Date.now(),
      status: 'paid',
      creatorName: 'Selindell 官方',
      creatorAvatar: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=selindell',
      lore: '诞生于塞琳德尔实验室的初代灵感造物，象征着科技与生命的完美共振。',
      stats: { power: 99, agility: 95, soul: 92, rarity: 'UR' }
    },
    {
      id: 'official-2',
      title: '蒸汽神龙 · 鎏金版',
      imageUrl: 'https://images.unsplash.com/photo-1566131444836-3395c448083e?auto=format&fit=crop&q=80&w=600',
      imageUrls: ['https://images.unsplash.com/photo-1566131444836-3395c448083e?auto=format&fit=crop&q=80&w=600'],
      style: '机甲未来',
      prompt: '中式神龙形态的蒸汽朋克手办，黄铜齿轮与鎏金鳞片交织，口衔发光能量球。',
      timestamp: Date.now() - 100000,
      status: 'paid',
      creatorName: 'Selindell 官方',
      creatorAvatar: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=selindell',
      lore: '将东方神话与西方工业美学融合的巅峰之作，每一个齿轮都蕴含着古老的智慧。',
      stats: { power: 98, agility: 88, soul: 99, rarity: 'UR' }
    }
  ];

  useEffect(() => {
    const fetchSquareData = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('status', 'paid')
          .order('create_at', { ascending: false })
          .limit(20);

        if (error) throw error;

        const mapped: SquareItem[] = (data || []).map(item => ({
          id: item.id,
          title: item.prompt ? item.prompt.slice(0, 15) : '未知造物',
          imageUrl: item.preview_images?.[0] || 'https://picsum.photos/seed/placeholder/400/400',
          imageUrls: item.preview_images || [],
          style: item.style || '自由风格',
          prompt: item.prompt || '',
          timestamp: new Date(item.create_at).getTime(),
          status: 'paid',
          creatorName: `造物主_${item.id.slice(0, 4)}`,
          creatorAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.id}`,
          lore: `${item.style}流派的杰作，源于奇思妙想。`,
          stats: {
             power: Math.floor(Math.random() * 40) + 60,
             agility: Math.floor(Math.random() * 40) + 60,
             soul: Math.floor(Math.random() * 40) + 60,
             rarity: ['SSR', 'SR', 'R'][Math.floor(Math.random() * 3)]
          }
        }));
        
        // 合并官方和用户作品
        setItems([...officialItems, ...mapped]);
      } catch (e) {
        console.error("Square fetch error:", e);
        setItems(officialItems); // 出错至少显示官方的
      } finally {
        setLoading(false);
      }
    };
    fetchSquareData();
  }, []);

  if (loading && items.length === 0) return (
    <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
      <Loader2 className="animate-spin text-purple-600" size={40} />
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Connecting to Inspiration Pool...</p>
    </div>
  );

  return (
    <div className="py-8 animate-in fade-in duration-500">
      <div className="mb-10 text-center relative">
        <div className="inline-flex items-center space-x-2 mb-3 px-4 py-1.5 rounded-full bg-purple-50 border border-purple-100">
          <Sparkles size={12} className="text-purple-600 animate-pulse" />
          <span className="text-[10px] font-black tracking-[0.2em] text-purple-600 uppercase">造物灵感广场</span>
        </div>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">灵感无界 · 智造有形</h2>
        <p className="text-gray-400 text-xs mt-2 font-medium">查看并收藏其他造物主的奇幻杰作</p>
      </div>

      <div className="columns-2 gap-4 space-y-4 px-1">
        {items.map((item) => (
          <div 
            key={item.id} 
            onClick={() => setSelectedItem(item)}
            className="break-inside-avoid bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-sm active:scale-95 transition-all duration-300 group cursor-pointer"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-gray-50">
              <img src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.title} />
              {item.id.startsWith('official') && (
                <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/20">
                  <span className="text-[8px] font-black text-white uppercase tracking-widest">官方甄选</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 rounded-full overflow-hidden border border-gray-100 bg-gray-50">
                  <img src={item.creatorAvatar} className="w-full h-full object-cover" />
                </div>
                <span className="text-[11px] font-bold text-gray-700 truncate">{item.creatorName}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xl" onClick={() => setSelectedItem(null)}></div>
          <div className="relative w-full max-w-sm max-h-[85vh] overflow-y-auto no-scrollbar rounded-[40px] bg-white border border-gray-100 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setSelectedItem(null)}
              className="absolute top-6 right-6 z-10 p-2 bg-gray-100 rounded-full text-gray-400 active:scale-90 transition-all"
            >
              <X size={20} />
            </button>
            
            <div className="p-2">
              <div className="aspect-square rounded-[36px] overflow-hidden bg-gray-50 mb-6">
                <img src={selectedItem.imageUrl} className="w-full h-full object-cover" />
              </div>
              <div className="px-6 pb-10">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-black text-gray-900">{selectedItem.title}</h3>
                  <span className="text-[10px] font-black text-purple-500 uppercase tracking-widest bg-purple-50 px-3 py-1 rounded-full">{selectedItem.style}</span>
                </div>
                
                {selectedItem.stats && selectedItem.lore && (
                  <StatsCard stats={selectedItem.stats} lore={selectedItem.lore} />
                )}

                <div className="mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">灵感描述</span>
                  <p className="text-xs text-gray-600 leading-relaxed font-medium">“{selectedItem.prompt}”</p>
                </div>
                
                <div className="mt-8 pt-8 border-t border-gray-50 text-center">
                  <p className="text-[10px] text-gray-300 font-black uppercase tracking-[0.4em]">Inspiration Shared by {selectedItem.creatorName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Square;
