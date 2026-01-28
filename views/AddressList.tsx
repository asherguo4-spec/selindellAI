
import React, { useState } from 'react';
import { ChevronLeft, Plus, MapPin, User, Phone, Trash2, X } from 'lucide-react';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.location) return;
    onAddAddress(formData);
    setFormData({ name: '', phone: '', location: '' });
    setIsAdding(false);
  };

  return (
    <div className="p-6 pb-24 animate-in slide-in-from-right duration-300 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 bg-white/5 rounded-full"><ChevronLeft size={20} /></button>
          <h2 className="text-xl font-bold">我的地址</h2>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="space-y-4">
        {addresses.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <MapPin size={48} className="mx-auto mb-4 opacity-20" />
            <p>暂无收货地址</p>
          </div>
        ) : (
          addresses.map((addr) => (
            <div key={addr.id} className="glass-card rounded-3xl p-5 relative border-white/5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-lg">{addr.name}</span>
                    <span className="text-gray-400 font-mono text-sm">{addr.phone}</span>
                    {addr.isDefault && (
                      <span className="bg-purple-500/20 text-purple-400 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-widest">默认</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">{addr.location}</p>
                </div>
                <button 
                  onClick={() => onDeleteAddress(addr.id)}
                  className="text-gray-600 hover:text-red-500 p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Address Sheet/Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAdding(false)}></div>
          <div className="w-full max-w-md bg-[#1a1426] rounded-[32px] p-6 animate-in slide-in-from-bottom-full duration-300 relative border border-white/10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">新增收货地址</h3>
              <button onClick={() => setIsAdding(false)} className="text-gray-400"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">收货人姓名</label>
                <div className="flex items-center bg-white/5 rounded-2xl p-4 border border-white/5 focus-within:border-purple-500/50 transition-colors">
                  <User size={18} className="text-gray-500 mr-3" />
                  <input 
                    type="text" 
                    placeholder="请输入收货人姓名"
                    className="bg-transparent border-none focus:ring-0 text-sm w-full"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">手机号码</label>
                <div className="flex items-center bg-white/5 rounded-2xl p-4 border border-white/5 focus-within:border-purple-500/50 transition-colors">
                  <Phone size={18} className="text-gray-500 mr-3" />
                  <input 
                    type="tel" 
                    placeholder="请输入手机号码"
                    className="bg-transparent border-none focus:ring-0 text-sm w-full"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">详细地址</label>
                <div className="flex items-start bg-white/5 rounded-2xl p-4 border border-white/5 focus-within:border-purple-500/50 transition-colors">
                  <MapPin size={18} className="text-gray-500 mr-3 mt-1" />
                  <textarea 
                    placeholder="请输入详细收货地址"
                    rows={3}
                    className="bg-transparent border-none focus:ring-0 text-sm w-full resize-none"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full h-14 rounded-2xl purple-gradient font-bold text-lg shadow-xl shadow-purple-500/30 mt-4 active:scale-95 transition-all"
              >
                保存地址
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressList;
