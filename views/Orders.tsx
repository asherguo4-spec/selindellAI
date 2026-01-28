
import React, { useEffect, useState } from 'react';
import { GeneratedCreation } from '../types';
import { Loader2, RefreshCw, AlertCircle, Database } from 'lucide-react';
import { supabase } from '../lib/supabase.ts';

interface OrdersProps {
  userId: string;
  creations: GeneratedCreation[];
}

const Orders: React.FC<OrdersProps> = ({ userId, creations }) => {
  const [dbOrders, setDbOrders] = useState<GeneratedCreation[]>([]);
  const [loading, setLoading] = useState(true);
  const [schemaError, setSchemaError] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    setSchemaError(false);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('create_at', { ascending: false });

      if (error) {
        // 如果报错提示列不存在 (PostgreSQL 错误码 42703)
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [userId]);

  // 合并本地临时生成的作品和数据库拉取的作品
  const allOrders = [...dbOrders];
  const existingIds = new Set(allOrders.map(o => o.id));
  creations.forEach(c => {
    if (!existingIds.has(c.id)) {
      allOrders.push(c);
    }
  });

  if (loading && dbOrders.length === 0) return (
    <div className="flex flex-col items-center justify-center py-40">
      <Loader2 className="animate-spin text-purple-500 mb-4" size={32} />
      <p className="text-gray-500 text-sm">正在同步您的私人馆藏...</p>
    </div>
  );

  return (
    <div className="p-6 pb-24">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold">我的造物馆</h2>
          {schemaError && (
            <div className="flex items-center space-x-1 mt-1">
              <Database size={10} className="text-orange-500" />
              <span className="text-[10px] text-orange-500/70 font-bold uppercase tracking-tighter">Local Isolation Mode</span>
            </div>
          )}
        </div>
        <button onClick={fetchOrders} className="p-2 bg-white/5 rounded-full text-gray-400 active:rotate-180 transition-transform">
          <RefreshCw size={20} />
        </button>
      </div>

      {allOrders.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <AlertCircle size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-sm">暂无作品，快去首页创作吧</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {allOrders.map((order) => (
            <div key={order.id} className="glass-card rounded-[32px] p-4 flex space-x-4 border-white/5 animate-in fade-in slide-in-from-bottom-2">
              <div className="w-24 h-32 rounded-2xl overflow-hidden bg-white/5 shrink-0">
                <img src={order.imageUrl} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-bold uppercase tracking-tighter">
                      {order.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-white mt-2 text-sm line-clamp-1">{order.title}</h3>
                  <p className="text-[10px] text-gray-500 mt-1">{order.style}</p>
                </div>
                <p className="text-[9px] text-gray-700 font-mono">{new Date(order.timestamp).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
