
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
      // 模拟微信支付延迟
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { error: orderError } = await supabase.from('orders').insert([{
        user_id: userId,
        prompt: creation.prompt,
        style: creation.style,
        amount: 299,
        status: 'paid', // 支付成功，状态设为已支付
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
      <div className="flex flex-col items-center justify-center h-full p-8 space-y-8 animate-in fade-in zoom-in duration-500 bg-black">
        <div className="relative">
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center animate-pulse">
            <CheckCircle2 className="text-green-500" size={56} />
          </div>
          <div className="absolute inset-0 bg-green-500/10 blur-3xl rounded-full"></div>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black tracking-tighter text-white">支付成功</h2>
          <p className="text-gray-500 text-sm max-w-[200px] mx-auto">订单已发送至 3D 打印车间，正在准备排产...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 pb-32 h-full overflow-y-auto no-scrollbar animate-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="p-2 bg-white/5 rounded-full"><ChevronLeft size={20} /></button>
        <h2 className="text-lg font-bold">订单确认</h2>
        <div className="w-9"></div>
      </div>

      {/* Address Section */}
      <div className="mb-6 glass-card rounded-[28px] p-5 border-white/5 bg-white/[0.02]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">收货人信息</h3>
          {!selectedAddressId && <span className="text-red-500 text-[10px] font-bold animate-pulse">请补充地址</span>}
        </div>
        
        {selectedAddress ? (
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <MapPin size={20} />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white">{selectedAddress.name}</span>
                <span className="text-gray-500 font-mono text-xs">{selectedAddress.phone}</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1 line-clamp-1">{selectedAddress.location}</p>
            </div>
            <ChevronRight size={16} className="text-gray-700" />
          </div>
        ) : (
          <div className="py-4 border-2 border-dashed border-white/5 rounded-xl text-center">
            <p className="text-xs text-gray-600">暂无地址，请前往设置</p>
          </div>
        )}
      </div>

      {/* Product Card */}
      <div className="mb-8 glass-card rounded-[28px] p-5 border-white/5 flex space-x-4">
        <div className="w-24 h-32 rounded-2xl overflow-hidden bg-black/40 border border-white/5">
          <img src={creation.imageUrl} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 flex flex-col justify-between py-1">
          <div>
            <span className="text-[9px] font-bold text-purple-400 uppercase tracking-widest">{creation.style}</span>
            <h3 className="text-lg font-black text-white mt-1">Selindell 定制实物</h3>
            <p className="text-[10px] text-gray-500 mt-1">含：3D打印成型、Selindell标、手工上色</p>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-black text-white">¥ 299</span>
            <span className="text-[10px] text-gray-600 font-bold mb-1">数量: x1</span>
          </div>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="glass-card rounded-[28px] p-6 border-white/5 space-y-3 mb-10">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">商品总额</span>
          <span className="text-white">¥ 299.00</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">定制运费</span>
          <span className="text-green-500 font-bold">免运费</span>
        </div>
        <div className="h-[1px] bg-white/5 my-2"></div>
        <div className="flex justify-between items-center pt-1">
          <span className="font-bold text-white">实付款</span>
          <span className="text-2xl font-black text-purple-500">¥ 299.00</span>
        </div>
      </div>

      {/* Pay Button */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[92%] max-w-sm">
        <button 
          onClick={handleInitiatePay}
          disabled={!selectedAddressId}
          className={`w-full h-18 rounded-full flex items-center justify-center space-x-3 font-black text-xl transition-all shadow-2xl active:scale-95 ${
            selectedAddressId ? 'purple-gradient shadow-purple-500/30' : 'bg-gray-800 text-gray-600 cursor-not-allowed'
          }`}
        >
          <Wallet size={22} />
          <span>微信支付 ¥299</span>
        </button>
      </div>

      {/* WeChat Simulated Modal */}
      {showWechatModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => !isPaying && setShowWechatModal(false)}></div>
          <div className="relative w-full max-w-xs bg-white rounded-[32px] p-8 text-center animate-in zoom-in-95 overflow-hidden">
            <button onClick={() => !isPaying && setShowWechatModal(false)} className="absolute top-4 right-4 text-gray-300 hover:text-gray-500">
              <X size={20} />
            </button>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl shadow-green-200">
                <svg viewBox="0 0 24 24" width="40" height="40" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">微信支付</h3>
              <p className="text-gray-400 text-xs mb-8">向 Selindell 官方支付订单费用</p>
              
              <div className="w-full border-t border-b border-gray-100 py-6 mb-8">
                <span className="text-sm text-gray-400">支付金额</span>
                <div className="text-4xl font-black text-gray-900 mt-1">¥ 299.00</div>
              </div>

              <button 
                onClick={handleWechatPayConfirm}
                disabled={isPaying}
                className="w-full h-14 bg-[#07C160] hover:bg-[#06ae56] text-white rounded-xl font-bold text-lg flex items-center justify-center space-x-2 active:scale-95 transition-all shadow-lg shadow-green-100"
              >
                {isPaying ? <Loader2 className="animate-spin" size={20} /> : <span>确认支付</span>}
              </button>
              <p className="text-[10px] text-gray-300 mt-4 font-bold uppercase tracking-widest">Secure WeChat Pay Gateway</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
