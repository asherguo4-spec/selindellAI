
import React, { useEffect, useState } from 'react';
import { GeneratedCreation, AppView } from '../types';
import { Loader2, RefreshCw, AlertCircle, Database, Plus, SearchX } from 'lucide-react';
import { supabase } from '../lib/supabase.ts';

interface OrdersProps {
  userId: string;
  creations: GeneratedCreation[];
  setView: (view: AppView) => void;
}

const Orders: React.FC<OrdersProps> = ({ userId, creations, setView }) => {
  const [dbOrders, setDbOrders] = useState<GeneratedCreation[]>([]);
  const [loading, setLoading] = useState(true);
  const [schemaError, setSchemaError] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setSchemaError(false);
    setFetchError(null);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('create_at', { ascending: false });

      if (error) {
        if (error.message.includes('user_id') || error.code === '42703') {
          console.warn("数据库架构未升级：缺少 user_id 列，已转为本地馆藏模式。");
          setSchemaError(true);
          setDbOrders([]);
          return;
        }
        throw error;
      }

      const mappedData: GeneratedCreation[] = (data || []).map(item => ({
        id: item.id,
        title: item.prompt ? (item.prompt.slice(0, 10) + '...') : '未命名作品',
        imageUrl: item.preview_images?.[0] || 'https://picsum.photos/seed/placeholder/200/300', 
        imageUrls: item.preview_images || [],
        style: item.style || '默认风格',
        prompt: item.prompt || '',
        timestamp: item.create_at ? new Date(item.create_at).getTime() : Date.now(),
        status: (item.status || 'pending') as any
      }));

      setDbOrders(mappedData);
    } catch (err: any) {
      console.error("Fetch orders failed:", err.message);
      setFetchError("订单同步异常，请点击刷新重试");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [userId]);

  const allOrders = [...dbOrders];
  const existingIds = new Set(allOrders.map(o => o.id));
  creations.forEach(c => {
    if (!existingIds.has(c.id)) {
      allOrders.push(c);
    }
  });

  if (loading && dbOrders.length === 0) return (
    <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
      <div className="relative">
        <Loader2 className="animate-spin text-purple-500" size={48} />
        <div className="absolute inset-0 bg-purple-500/10 blur-xl rounded-full"></div>
      </div>
      <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">Syncing Collection...</p>
    </div>
  );

  return (
    <div className="py-8 flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center mb-10 shrink-0">
        <div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">订单</h2>
          {schemaError && (
            <div className="flex items-center space-x-1 mt-1">
              <Database size={10} className="text-orange-500" />
              <span className="text-[10px] text-orange-500/70 font-bold uppercase tracking-tighter">Local Isolation Mode</span>
            </div>
          )}
        </div>
        <button 
          onClick={fetchOrders} 
          disabled={loading}
          className={`p-3 bg-white/5 rounded-full text-gray-400 active:rotate-180 transition-all duration-500 ${loading ? 'opacity-30' : 'hover:bg-white/10'}`}
        >
          <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
        {fetchError && (
          <div className="glass-card rounded-[32px] p-8 border-red-500/20 mb-8 flex flex-col items-center text-center">
            <AlertCircle className="text-red-500 mb-4" size={32} />
            <p className="text-gray-400 mb-6">{fetchError}</p>
            <button onClick={fetchOrders} className="text-[10px] font-black uppercase tracking-widest text-purple-400 border border-purple-500/20 px-6 py-3 rounded-full">重试连接</button>
          </div>
        )}

        {allOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 md:py-32 px-10 text-center animate-in fade-in zoom-in duration-700">
            <div className="w-32 h-32 bg-white/[0.02] rounded-full flex items-center justify-center mb-8 border border-white/5 relative">
              <SearchX size={56} className="text-gray-800" />
              <div className="absolute inset-0 bg-purple-500/5 blur-3xl rounded-full"></div>
            </div>
            <h3 className="text-2xl font-black mb-4 text-white">馆内空空如也</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-10 max-w-sm">您的造物灵感还未落入尘世。现在就开始第一场造物仪式吧？</p>
            <button 
              onClick={() => setView(AppView.HOME)}
              className="w-full max-w-xs h-16 rounded-[24px] purple-gradient flex items-center justify-center space-x-3 font-black text-white active:scale-95 transition-all shadow-xl shadow-purple-500/20"
            >
              <Plus size={20} />
              <span>开启第一件作品</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allOrders.map((order) => (
              <div key={order.id} className="glass-card rounded-[32px] p-4 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-5 border-white/5 hover:border-purple-500/30 active:scale-[0.98] transition-all animate-in fade-in slide-in-from-bottom-4 group">
                <div className="w-full md:w-24 aspect-square md:aspect-[3/4] rounded-2xl overflow-hidden bg-black/40 shrink-0 border border-white/5">
                  <img src={order.imageUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 font-black uppercase tracking-widest">
                        {order.status === 'paid' ? '已排产' : order.status}
                      </span>
                      <span className="text-[9px] text-gray-700 font-mono">#{order.id.slice(0, 6)}</span>
                    </div>
                    <h3 className="font-bold text-white mt-4 text-lg line-clamp-2 leading-tight">{order.title}</h3>
                    <p className="text-[10px] text-gray-500 mt-1 font-black uppercase tracking-widest">{order.style}</p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-[9px] text-gray-700 font-mono">{new Date(order.timestamp).toLocaleDateString()}</p>
                    <button className="text-[10px] font-black text-purple-400 uppercase tracking-widest hover:text-purple-300 transition-colors">查看细节</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
