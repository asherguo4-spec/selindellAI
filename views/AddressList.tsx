
import React, { useState } from 'react';
import { ChevronLeft, Plus, MapPin, User, Phone, Trash2, X, AlertCircle } from 'lucide-react';
import { Address } from '../types';

interface AddressListProps {
  addresses: Address[];
  onAddAddress: (address: Omit<Address, 'id' | 'isDefault'>) => void;
  onDeleteAddress: (id: string) => void;
  onBack: () => void;
}

const AddressList: React.FC<AddressListProps> = ({ addresses, onAddAddress, onDeleteAddress, onBack }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: ''
  });
  const [errorHint, setErrorHint] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) { setErrorHint("请输入收货人姓名"); return; }
    if (!formData.phone.trim()) { setErrorHint("请输入联系电话"); return; }
    if (!/^1[3-9]\d{9}$/.test(formData.phone.trim())) { setErrorHint("手机号码格式不正确"); return; }
    if (!formData.location.trim()) { setErrorHint("请输入详细收货地址"); return; }
    
    onAddAddress(formData);
    setFormData({ name: '', phone: '', location: '' });
    setErrorHint(null);
    setIsAdding(false);
  };

  return (
    <div className="p-6 pb-24 animate-in slide-in-from-right duration-300 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 bg-white/5 rounded-full"><ChevronLeft size={20} /></button>
          <h2 className="text-xl font-bold">我的收货地址</h2>
        </div>
        <button 
          onClick={() => { setErrorHint(null); setIsAdding(true); }}
          className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 active:scale-95 transition-all"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="space-y-4">
        {addresses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-10 text-center animate-in fade-in zoom-in duration-700">
            <div className="w-24 h-24 bg-white/[0.03] rounded-full flex items-center justify-center mb-6 border border-white/5 relative">
              <MapPin size={40} className="text-gray-700" />
              <div className="absolute inset-0 bg-purple-500/5 blur-2xl rounded-full"></div>
            </div>
            <h3 className="text-white font-bold text-lg mb-2">造物虽美，也需归途</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">添加一个收货地址，让您的灵感实物化后能准确敲开家门</p>
            <button 
              onClick={() => { setErrorHint(null); setIsAdding(true); }}
              className="px-10 py-4 bg-white/5 rounded-full text-purple-400 font-bold text-sm border border-purple-500/30 active:scale-95 transition-all shadow-lg"
            >
              立即添加新地址
            </button>
          </div>
        ) : (
          addresses.map((addr) => (
            <div key={addr.id} className="glass-card rounded-3xl p-5 relative border-white/5 hover:border-purple-500/20 transition-colors">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-lg">{addr.name}</span>
                    <span className="text-gray-400 font-mono text-sm">{addr.phone}</span>
                    {addr.isDefault && (
                      <span className="bg-purple-500/20 text-purple-400 text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-widest">默认</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{addr.location}</p>
                </div>
                <button 
                  onClick={() => onDeleteAddress(addr.id)}
                  className="text-gray-700 hover:text-red-500 p-1 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Address Sheet */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setIsAdding(false)}></div>
          <div className="w-full max-w-md bg-[#0f0a19] rounded-[40px] p-8 animate-in slide-in-from-bottom-full duration-500 relative border border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black tracking-tight text-white">新增地址</h3>
              <button onClick={() => setIsAdding(false)} className="text-gray-500 hover:text-white p-1 transition-colors"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-1">收货人姓名</label>
                <div className="flex items-center bg-white/5 rounded-2xl p-4 border border-white/5 focus-within:border-purple-500/50 transition-all">
                  <User size={18} className="text-gray-500 mr-3" />
                  <input 
                    type="text" 
                    placeholder="请输入收货人姓名"
                    className="bg-transparent border-none focus:ring-0 text-sm w-full text-white"
                    value={formData.name}
                    onChange={(e) => { setFormData({...formData, name: e.target.value}); setErrorHint(null); }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-1">手机号码</label>
                <div className="flex items-center bg-white/5 rounded-2xl p-4 border border-white/5 focus-within:border-purple-500/50 transition-all">
                  <Phone size={18} className="text-gray-500 mr-3" />
                  <input 
                    type="tel" 
                    placeholder="11位手机号"
                    className="bg-transparent border-none focus:ring-0 text-sm w-full text-white"
                    value={formData.phone}
                    onChange={(e) => { setFormData({...formData, phone: e.target.value}); setErrorHint(null); }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-1">详细地址</label>
                <div className="flex items-start bg-white/5 rounded-2xl p-4 border border-white/5 focus-within:border-purple-500/50 transition-all">
                  <MapPin size={18} className="text-gray-500 mr-3 mt-1" />
                  <textarea 
                    placeholder="街道、楼牌号等详细信息"
                    rows={3}
                    className="bg-transparent border-none focus:ring-0 text-sm w-full resize-none text-white leading-relaxed"
                    value={formData.location}
                    onChange={(e) => { setFormData({...formData, location: e.target.value}); setErrorHint(null); }}
                  />
                </div>
              </div>

              {errorHint && (
                <div className="flex items-center space-x-2 text-red-400 bg-red-400/10 p-3 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
                  <AlertCircle size={14} />
                  <span className="text-[11px] font-bold">{errorHint}</span>
                </div>
              )}

              <button 
                type="submit"
                className="w-full h-16 rounded-2xl purple-gradient font-black text-lg shadow-2xl shadow-purple-500/40 mt-4 active:scale-95 transition-all text-white"
              >
                确认并保存地址
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressList;
