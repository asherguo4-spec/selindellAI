
import React, { useState } from 'react';
import { ChevronLeft, MapPin, CreditCard, CheckCircle2, Loader2, Wallet, X, ChevronRight } from 'lucide-react';
import { GeneratedCreation, Address } from '../types';
import { supabase } from '../lib/supabase';

interface CheckoutProps {
  userId: string;
  creation: GeneratedCreation;
  addresses: Address[];
  onPaymentComplete: (creationId: string) => void;
  onBack: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ userId, creation, addresses, onPaymentComplete, onBack }) => {
  const [selectedAddressId, setSelectedAddressId] = useState<string>(addresses.find(a => a.isDefault)?.id || addresses[0]?.id || '');
  const [isPaying, setIsPaying] = useState(false);
  const [showWechatModal, setShowWechatModal] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const selectedAddress = addresses.find(a => a.id === selectedAddressId);

  const handleInitiatePay = () => {
    if (!selectedAddressId) {
      alert("请先添加并选择收货地址");
      return;
    }
    setShowWechatModal(true);
  };

  const handleWechatPayConfirm = async () => {
    setIsPaying(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { error: orderError } = await supabase.from('orders').insert([{
        user_id: userId,
        prompt: creation.prompt,
        style: creation.style,
        amount: 299,
        status: 'paid',
        preview_images: creation.imageUrls
      }]);

      if (orderError && orderError.code !== '42703') throw orderError;

      setIsSuccess(true);
      setShowWechatModal(false);
      setTimeout(() => onPaymentComplete(creation.id), 2000);
    } catch (error: any) {
      alert(`支付系统通讯异常: ${error.message}`);
    } finally {
      setIsPaying(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center h-[90vh] p-8 space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="relative">
          <div className="w-32 h-32 bg-green-500/20 rounded-full flex items-center justify-center animate-pulse">
            <CheckCircle2 className="text-green-500" size={64} />
          </div>
          <div className="absolute inset-0 bg-green-500/10 blur-3xl rounded-full"></div>
        </div>
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-black tracking-tighter text-white">支付成功</h2>
          <p className="text-gray-500 text-base max-w-[280px] mx-auto leading-relaxed">您的专属造物已加入排产队列，3D 打印工匠正在准备材料...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 pb-32 animate-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between mb-10">
        <button onClick={onBack} className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors"><ChevronLeft size={24} /></button>
        <h2 className="text-2xl font-black">订单确认</h2>
        <div className="w-12"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Section: Details */}
        <div className="lg:col-span-3 space-y-6">
          <div className="glass-card rounded-[32px] p-6 border-white/5 bg-white/[0.02]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">收货人信息</h3>
              {!selectedAddressId && <span className="text-red-500 text-[10px] font-black animate-pulse">请补充地址</span>}
            </div>
            
            {selectedAddress ? (
              <div className="flex items-center space-x-5">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/10">
                  <MapPin size={28} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-black text-white">{selectedAddress.name}</span>
                    <span className="text-gray-500 font-mono text-sm">{selectedAddress.phone}</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{selectedAddress.location}</p>
                </div>
                <ChevronRight size={20} className="text-gray-800" />
              </div>
            ) : (
              <div className="py-10 border-2 border-dashed border-white/5 rounded-[24px] text-center">
                <p className="text-sm text-gray-600 font-bold">暂无收货地址</p>
                <button className="mt-2 text-purple-400 text-xs font-black uppercase tracking-widest">前往添加</button>
              </div>
            )}
          </div>

          <div className="glass-card rounded-[32px] p-6 border-white/5 flex space-x-6 items-center">
            <div className="w-28 h-36 rounded-2xl overflow-hidden bg-black/40 border border-white/5 shrink-0">
              <img src={creation.imageUrl} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 flex flex-col justify-between py-1">
              <div>
                <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest px-2 py-0.5 bg-purple-500/10 rounded-full">{creation.style}</span>
                <h3 className="text-2xl font-black text-white mt-3 leading-tight">{creation.title}</h3>
                <p className="text-xs text-gray-500 mt-2">含：手工精调 3D 打印模型、Selindell 专属底座、特制防尘展示盒</p>
              </div>
              <div className="flex items-end justify-between mt-4">
                <span className="text-3xl font-black text-white">¥ 299</span>
                <span className="text-xs text-gray-600 font-bold mb-1">数量: x1</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Summary */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-[32px] p-8 border-white/5 sticky top-24">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-8">费用详情</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">商品总额</span>
                <span className="text-white font-mono">¥ 299.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">专业定制物流</span>
                <span className="text-green-500 font-bold uppercase tracking-widest">免运费</span>
              </div>
              <div className="h-[1px] bg-white/5 my-4"></div>
              <div className="flex justify-between items-center pt-2 mb-10">
                <span className="font-black text-white text-lg">实付款</span>
                <div className="text-right">
                  <span className="text-4xl font-black text-purple-500">¥ 299.00</span>
                  <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest mt-1">含税费 & 定制费</p>
                </div>
              </div>

              <button 
                onClick={handleInitiatePay}
                disabled={!selectedAddressId}
                className={`w-full h-20 rounded-[28px] flex items-center justify-center space-x-3 font-black text-xl transition-all shadow-2xl active:scale-95 ${
                  selectedAddressId ? 'purple-gradient shadow-purple-500/30' : 'bg-white/5 text-gray-700 cursor-not-allowed'
                }`}
              >
                <Wallet size={24} />
                <span>微信支付 ¥299</span>
              </button>
              
              <p className="text-center text-[9px] text-gray-700 font-black uppercase tracking-[0.2em] mt-6 leading-relaxed">
                下单即视为同意 <span className="text-gray-500 underline">定制产品服务协议</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* WeChat Modal */}
      {showWechatModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => !isPaying && setShowWechatModal(false)}></div>
          <div className="relative w-full max-w-sm bg-white rounded-[40px] p-10 text-center animate-in zoom-in-95 overflow-hidden">
            <button onClick={() => !isPaying && setShowWechatModal(false)} className="absolute top-6 right-6 text-gray-300 hover:text-gray-500 transition-colors">
              <X size={24} />
            </button>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-[#07C160] rounded-3xl flex items-center justify-center text-white mb-8 shadow-2xl shadow-green-200">
                <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">微信支付</h3>
              <p className="text-gray-400 text-sm mb-10">Selindell 官方造物订单支付</p>
              
              <div className="w-full border-t border-b border-gray-50 py-8 mb-10">
                <span className="text-xs text-gray-400 font-black uppercase tracking-widest">支付金额</span>
                <div className="text-5xl font-black text-gray-900 mt-2">¥ 299.00</div>
              </div>

              <button 
                onClick={handleWechatPayConfirm}
                disabled={isPaying}
                className="w-full h-18 bg-[#07C160] hover:bg-[#06ae56] text-white rounded-[24px] font-black text-xl flex items-center justify-center space-x-3 active:scale-95 transition-all shadow-xl shadow-green-100"
              >
                {isPaying ? <Loader2 className="animate-spin" size={24} /> : <span>确认支付</span>}
              </button>
              <p className="text-[10px] text-gray-300 mt-6 font-black uppercase tracking-widest tracking-[0.3em]">Secure Transaction</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
