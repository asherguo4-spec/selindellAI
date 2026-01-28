
import React, { useEffect, useState } from 'react';
import { GeneratedCreation } from '../types';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase.ts'; // 显式包含 .ts 后缀帮助打包

interface OrdersProps {
  creations: GeneratedCreation[];
}

const Orders: React.FC<OrdersProps> = ({ creations }) => {
  const [dbOrders, setDbOrders] = useState<GeneratedCreation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('create_at', { ascending: false });

      if (error) throw error;

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

  useEffect(() => { fetchOrders(); }, []);

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
      <p className="text-gray-500 text-sm">正在同步云端数据...</p>
    </div>
  );

  return (
    <div className="p-6 pb-24">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">我的造物馆</h2>
        <button onClick={fetchOrders} className="p-2 bg-white/5 rounded-full text-gray-400">
          <RefreshCw size={20} />
        </button>
      </div>

      {allOrders.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <AlertCircle size={48} className="mx-auto mb-4 opacity-20" />
          <p>暂无作品数据</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {allOrders.map((order) => (
            <div key={order.id} className="glass-card rounded-[32px] p-4 flex space-x-4 border-white/5">
              <img src={order.imageUrl} className="w-24 h-32 rounded-2xl object-cover" />
              <div className="flex-1">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 font-bold uppercase">
                  {order.status}
                </span>
                <h3 className="font-bold text-white mt-2 mb-1">{order.title}</h3>
                <p className="text-xs text-gray-500">{order.style}</p>
                <p className="text-[10px] text-gray-600 mt-4">{new Date(order.timestamp).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
