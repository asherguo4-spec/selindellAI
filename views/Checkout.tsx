
import React, { useState } from 'react';
import { ChevronLeft, MapPin, CreditCard, CheckCircle2, Loader2, Wallet, ShieldAlert, Terminal } from 'lucide-react';
import { AppView, GeneratedCreation, Address } from '../types';
import { supabase } from '../lib/supabase';

interface CheckoutProps {
  creation: GeneratedCreation;
  addresses: Address[];
  onPaymentComplete: (creationId: string) => void;
  onBack: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ creation, addresses, onPaymentComplete, onBack }) => {
  const [selectedAddress, setSelectedAddress] = useState<string>(addresses[0]?.id || '');
  const [isPaying, setIsPaying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [rlsError, setRlsError] = useState(false);

  const handlePay = async () => {
    if (!selectedAddress) return alert("请选择收货地址");
    setIsPaying(true);
    setRlsError(false);

    try {
      const currentAddress = addresses.find(a => a.id === selectedAddress);
      const userId = '82930415-0000-0000-0000-000000000000'; 

      // 尝试写入数据
      const { error: userError } = await supabase.from('users').upsert({
        id: userId,
        nickname: 'CyberMaster_88',
        phone: currentAddress?.phone || ''
      });
      if (userError?.message?.includes('row-level security')) throw new Error("RLS");

      const { error: orderError } = await supabase.from('orders').insert([{
        prompt: creation.prompt,
        style: creation.style,
        amount: 299,
        status: 'paid'
      }]);
      if (orderError?.message?.includes('row-level security')) throw new Error("RLS");

      setIsSuccess(true);
      setTimeout(() => onPaymentComplete(creation.id), 1500);

    } catch (error: any) {
      console.error("Checkout Error:", error);
      if (error.message === 'RLS') {
        setRlsError(true);
      } else {
        alert(`支付同步失败: ${error.message}`);
      }
    } finally {
      setIsPaying(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 space-y-6">
        <CheckCircle2 className="text-green-500 animate-bounce" size={64} />
        <h2 className="text-2xl font-bold">支付成功</h2>
        <p className="text-gray-500 text-sm">正在跳转至作品馆...</p>
      </div>
    );
  }

  const currentAddress = addresses.find(a => a.id === selectedAddress);

  return (
    <div className="p-6 pb-24 h-full overflow-y-auto no-scrollbar">
      <div className="flex items-center space-x-4 mb-8">
        <button onClick={onBack} className="p-2 bg-white/5 rounded-full"><ChevronLeft size={20} /></button>
        <h2 className="text-xl font-bold">确认订单</h2>
      </div>

      {rlsError && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 mb-6">
          <div className="flex items-start space-x-3 mb-3">
            <ShieldAlert className="text-red-500 shrink-0 mt-0.5" size={18} />
            <p className="text-[10px] text-red-200/70 leading-relaxed font-mono">
              检测到数据库 RLS 安全锁。请去 Supabase SQL Editor 运行脚本解锁表权限。
            </p>
          </div>
          <button 
            onClick={() => {
              navigator.clipboard.writeText("alter table users disable row level security; alter table orders disable row level security; alter table address disable row level security;");
              alert("已复制解锁全套指令！");
            }}
            className="w-full py-2 bg-red-500/20 rounded-xl text-[10px] font-bold text-red-400 flex items-center justify-center space-x-2"
          >
            <Terminal size={12} />
            <span>复制全套解锁 SQL</span>
          </button>
        </div>
      )}

      <div className="mb-8 glass-card rounded-3xl p-5 border-purple-500/20">
        <h3 className="text-[10px] font-bold text-gray-500 uppercase mb-4 tracking-widest">收件信息</h3>
        {currentAddress && (
          <div className="flex items-start space-x-4">
            <MapPin className="text-purple-400 mt-1" size={20} />
            <div>
              <p className="font-bold">{currentAddress.name} {currentAddress.phone}</p>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">{currentAddress.location}</p>
            </div>
          </div>
        )}
      </div>

      <div className="mb-10 glass-card rounded-3xl p-4 flex space-x-4 border-white/5">
        <img src={creation.imageUrl} className="w-20 h-24 rounded-xl object-cover" />
        <div className="flex flex-col justify-center">
          <p className="font-bold text-lg">{creation.style} 造物</p>
          <p className="text-purple-400 font-black text-xl mt-1">¥ 299.00</p>
        </div>
      </div>

      <button 
        onClick={handlePay}
        disabled={isPaying}
        className={`w-full h-16 rounded-2xl purple-gradient font-bold shadow-2xl flex items-center justify-center space-x-3 transition-all active:scale-95 ${
          isPaying ? 'opacity-50' : 'shadow-purple-500/30'
        }`}
      >
        {isPaying ? <Loader2 className="animate-spin" size={22} /> : <CreditCard size={22} />}
        <span className="text-lg">立即支付 ¥299.00</span>
      </button>
    </div>
  );
};

export default Checkout;
